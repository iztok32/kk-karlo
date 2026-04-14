<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\CouponType;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CouponController extends Controller
{
    public function index(Request $request)
    {
        $canManageCoupons = auth()->user()->hasPermission('reservations.reserve-for-others');

        $query = Coupon::with(['user:id,name', 'couponType:id,name', 'reservation.appointment', 'reservation.horse'])
            ->orderBy('created_at', 'desc');

        if (! $canManageCoupons) {
            $query->where('user_id', auth()->id());
        }

        $coupons = $query->get();

        $couponTypes = CouponType::all();

        $users = $canManageCoupons
            ? User::where('is_active', true)->orderBy('name')->get(['id', 'name'])
            : User::where('id', auth()->id())->get(['id', 'name']);

        return Inertia::render('Club/Coupons/Index', [
            'coupons'          => $coupons,
            'couponTypes'      => $couponTypes,
            'users'            => $users,
            'canManageCoupons' => $canManageCoupons,
        ]);
    }

    public function store(Request $request)
    {
        $canManageCoupons = auth()->user()->hasPermission('reservations.reserve-for-others');

        $rules = [
            'coupon_type_id'   => 'required|exists:coupon_types,id',
            'quantity'         => 'required|integer|min:1',
            'transaction_type' => 'required|in:purchase,usage',
            'reservation_id'   => 'nullable|exists:reservations,id'
        ];

        if ($canManageCoupons) {
            $rules['user_id'] = 'required|exists:users,id';
        }

        $validated = $request->validate($rules);

        if (! $canManageCoupons) {
            $validated['user_id'] = auth()->id();
        }

        Coupon::create($validated);

        return redirect()->back()->with('success', __('Coupon record added successfully.'));
    }

    public function destroy(Coupon $coupon)
    {
        $canManageCoupons = auth()->user()->hasPermission('reservations.reserve-for-others');

        if (! $canManageCoupons && $coupon->user_id !== auth()->id()) {
            abort(403, __('Unauthorized.'));
        }

        $coupon->delete();

        return redirect()->back()->with('success', __('Coupon record deleted successfully.'));
    }
}
