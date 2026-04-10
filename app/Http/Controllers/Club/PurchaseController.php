<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\CouponType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Stripe\StripeClient;
use Stripe\Exception\SignatureVerificationException;

class PurchaseController extends Controller
{
    private function stripe(): StripeClient
    {
        return new StripeClient(config('services.stripe.secret_key'));
    }

    /**
     * Purchase & history page.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $couponTypes = CouponType::orderBy('name')->get(['id', 'name', 'price']);

        // Full coupon ledger for this user
        $history = Coupon::with('couponType')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($c) => [
                'id'               => $c->id,
                'coupon_type_id'   => $c->coupon_type_id,
                'coupon_type_name' => $c->couponType?->name,
                'quantity'         => $c->quantity,
                'transaction_type' => $c->transaction_type,
                'price_paid'       => $c->price_paid,
                'notes'            => $c->notes,
                'created_at'       => $c->created_at?->toIso8601String(),
            ]);

        // Balances per type
        $balances = DB::table('coupons')
            ->join('coupon_types', 'coupons.coupon_type_id', '=', 'coupon_types.id')
            ->select('coupon_types.id', 'coupon_types.name',
                DB::raw("SUM(CASE WHEN transaction_type = 'purchase' THEN quantity ELSE -quantity END) as balance"))
            ->where('coupons.user_id', $user->id)
            ->whereNull('coupons.deleted_at')
            ->groupBy('coupon_types.id', 'coupon_types.name')
            ->get()
            ->mapWithKeys(fn($r) => [$r->id => (int) $r->balance]);

        return Inertia::render('Club/Purchase/Index', [
            'couponTypes' => $couponTypes,
            'history'     => $history,
            'balances'    => $balances,
        ]);
    }

    /**
     * Create a Stripe PaymentIntent for the requested quantities.
     * Returns { client_secret }.
     */
    public function createIntent(Request $request)
    {
        $request->validate([
            'items'           => 'required|array|min:1',
            'items.*.type_id' => 'required|integer|exists:coupon_types,id',
            'items.*.qty'     => 'required|integer|min:1|max:100',
        ]);

        $items = collect($request->items);
        $typeIds = $items->pluck('type_id')->unique()->toArray();
        $types = CouponType::whereIn('id', $typeIds)->get()->keyBy('id');

        // Calculate total in cents
        $totalCents = 0;
        foreach ($items as $item) {
            $type = $types[$item['type_id']] ?? null;
            if (!$type || $type->price <= 0) {
                return back()->withErrors(['items' => __('Invalid coupon type or price not configured.')]);
            }
            $totalCents += (int) round($type->price * $item['qty'] * 100);
        }

        if ($totalCents < 50) {
            return back()->withErrors(['items' => __('Total amount is too low for payment processing.')]);
        }

        $stripe = $this->stripe();

        $intent = $stripe->paymentIntents->create([
            'amount'                    => $totalCents,
            'currency'                  => 'eur',
            'automatic_payment_methods' => ['enabled' => true],
            'metadata' => [
                'user_id'    => $request->user()->id,
                'user_email' => $request->user()->email,
                'items'      => json_encode($request->items),
            ],
        ]);

        return response()->json(['client_secret' => $intent->client_secret]);
    }

    /**
     * Verify successful payment and issue coupons.
     * Called from frontend after stripe.confirmPayment() succeeds.
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'payment_intent_id' => 'required|string',
            'items'             => 'required|array|min:1',
            'items.*.type_id'   => 'required|integer|exists:coupon_types,id',
            'items.*.qty'       => 'required|integer|min:1|max:100',
        ]);

        $stripe = $this->stripe();

        try {
            $intent = $stripe->paymentIntents->retrieve($request->payment_intent_id);
        } catch (\Exception $e) {
            return back()->withErrors(['payment' => __('Could not verify payment. Please contact support.')]);
        }

        if ($intent->status !== 'succeeded') {
            return back()->withErrors(['payment' => __('Payment has not been completed.')]);
        }

        $user = $request->user();
        $items = collect($request->items);
        $typeIds = $items->pluck('type_id')->unique()->toArray();
        $types = CouponType::whereIn('id', $typeIds)->get()->keyBy('id');

        DB::transaction(function () use ($user, $items, $types, $intent) {
            foreach ($items as $item) {
                $type = $types[$item['type_id']] ?? null;
                if (!$type) continue;

                $qty = (int) $item['qty'];
                $pricePaid = round($type->price * $qty, 2);

                // Idempotency: use payment_intent_id + type_id as unique guard
                $exists = Coupon::where('stripe_payment_intent_id', $intent->id)
                    ->where('coupon_type_id', $type->id)
                    ->exists();

                if ($exists) continue;

                Coupon::create([
                    'user_id'                  => $user->id,
                    'coupon_type_id'           => $type->id,
                    'quantity'                 => $qty,
                    'transaction_type'         => 'purchase',
                    'stripe_payment_intent_id' => $intent->id,
                    'price_paid'               => $pricePaid,
                ]);
            }
        });

        return redirect()->route('purchase.index')
            ->with('success', __('Payment successful! Coupons have been added to your account.'));
    }

    /**
     * Stripe webhook — fallback for cases where confirm() wasn't called
     * (e.g. browser closed after payment but before confirmation).
     */
    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        if ($webhookSecret) {
            try {
                $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
            } catch (SignatureVerificationException $e) {
                return response('Invalid signature', 400);
            }
        } else {
            $event = \Stripe\Event::constructFrom(json_decode($payload, true));
        }

        if ($event->type === 'payment_intent.succeeded') {
            $intent = $event->data->object;
            $metadata = $intent->metadata;

            if (!isset($metadata['user_id'], $metadata['items'])) {
                return response('OK');
            }

            $userId = (int) $metadata['user_id'];
            $items = json_decode($metadata['items'], true);

            if (!is_array($items)) return response('OK');

            $typeIds = array_column($items, 'type_id');
            $types = CouponType::whereIn('id', $typeIds)->get()->keyBy('id');

            DB::transaction(function () use ($userId, $items, $types, $intent) {
                foreach ($items as $item) {
                    $type = $types[$item['type_id']] ?? null;
                    if (!$type) continue;

                    $qty = (int) $item['qty'];

                    $exists = Coupon::where('stripe_payment_intent_id', $intent->id)
                        ->where('coupon_type_id', $type->id)
                        ->exists();

                    if ($exists) continue;

                    Coupon::create([
                        'user_id'                  => $userId,
                        'coupon_type_id'           => $type->id,
                        'quantity'                 => $qty,
                        'transaction_type'         => 'purchase',
                        'stripe_payment_intent_id' => $intent->id,
                        'price_paid'               => round($type->price * $qty, 2),
                    ]);
                }
            });
        }

        return response('OK');
    }
}
