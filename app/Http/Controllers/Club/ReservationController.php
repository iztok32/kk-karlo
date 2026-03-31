<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Horse;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $view      = $request->get('view', 'month');
        $startDate = $request->get('start');
        $endDate   = $request->get('end');

        // Default to current month if no dates provided
        if (! $startDate || ! $endDate) {
            $now       = Carbon::now();
            $startDate = $now->copy()->startOfMonth()->format('Y-m-d');
            $endDate   = $now->copy()->endOfMonth()->format('Y-m-d');
        }

        $appointments = Appointment::where('is_active', true)
            ->orderBy('start_time')
            ->orderBy('name')
            ->get();

        $reservations = Reservation::with(['user:id,name', 'horse:id,name'])
            ->whereBetween('reservation_date', [$startDate, $endDate])
            ->whereNull('deleted_at')
            ->get();

        $horses = Horse::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $canReserveForOthers = auth()->user()->hasPermission('reservations.reserve-for-others');

        $users = $canReserveForOthers
            ? User::where('is_active', true)->orderBy('name')->get(['id', 'name'])
            : collect();

        $myUpcoming = Reservation::with(['appointment', 'horse:id,name'])
            ->where('user_id', auth()->id())
            ->where('reservation_date', '>=', Carbon::today())
            ->whereNull('deleted_at')
            ->orderBy('reservation_date')
            ->orderBy('created_at')
            ->limit(20)
            ->get();

        return Inertia::render('Club/Reservations/Index', [
            'appointments'        => $appointments,
            'reservations'        => $reservations,
            'horses'              => $horses,
            'users'               => $users,
            'canReserveForOthers' => $canReserveForOthers,
            'startDate'           => $startDate,
            'endDate'             => $endDate,
            'currentView'         => $view,
            'authUserId'          => auth()->id(),
            'myUpcoming'          => $myUpcoming,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Reservation store request:', $request->all());

        $canReserveForOthers = auth()->user()->hasPermission('reservations.reserve-for-others');

        $rules = [
            'appointment_id'   => 'required|exists:appointments,id',
            'horse_id'         => 'required|exists:horses,id',
            'reservation_date' => 'required|date|after_or_equal:today',
            'notes'            => 'nullable|string|max:500',
        ];

        if ($canReserveForOthers) {
            $rules['user_id'] = 'required|exists:users,id';
        }

        $validated = $request->validate($rules);

        if (! $canReserveForOthers) {
            $validated['user_id'] = auth()->id();
        }

        // Check appointment is valid and active
        $appointment = Appointment::where('id', $validated['appointment_id'])
            ->where('is_active', true)
            ->firstOrFail();

        // Check capacity
        if ($appointment->capacity) {
            $count = Reservation::where('appointment_id', $validated['appointment_id'])
                ->where('reservation_date', $validated['reservation_date'])
                ->whereNull('deleted_at')
                ->count();

            if ($count >= $appointment->capacity) {
                return back()->withErrors(['appointment_id' => __('This appointment is fully booked.')]);
            }
        }

        // Check if user already has a reservation for this slot
        $existing = Reservation::where('user_id', $validated['user_id'])
            ->where('appointment_id', $validated['appointment_id'])
            ->where('reservation_date', $validated['reservation_date'])
            ->whereNull('deleted_at')
            ->first();

        if ($existing) {
            return back()->withErrors(['appointment_id' => __('User already has a reservation for this appointment on this date.')]);
        }

        $reservation = Reservation::create($validated);

        // Auto-deduct a coupon if the user has a positive balance of any type
        $balanceRecord = \Illuminate\Support\Facades\DB::table('coupons')
            ->select('coupon_type_id', \Illuminate\Support\Facades\DB::raw("SUM(CASE WHEN transaction_type = 'purchase' THEN quantity ELSE -quantity END) as balance"))
            ->where('user_id', $validated['user_id'])
            ->whereNull('deleted_at')
            ->groupBy('coupon_type_id')
            ->having('balance', '>', 0)
            ->first();

        if ($balanceRecord) {
            \App\Models\Coupon::create([
                'user_id' => $validated['user_id'],
                'coupon_type_id' => $balanceRecord->coupon_type_id,
                'quantity' => 1,
                'transaction_type' => 'usage',
                'reservation_id' => $reservation->id,
            ]);
        }

        return redirect()->back()->with('success', __('Reservation successfully added.'));
    }

    public function destroy(Reservation $reservation)
    {
        $canReserveForOthers = auth()->user()->hasPermission('reservations.reserve-for-others');

        // Only allow deleting own reservations unless has permission
        if (! $canReserveForOthers && $reservation->user_id !== auth()->id()) {
            abort(403, __('Unauthorized.'));
        }

        // Delete any related coupon usage records
        \App\Models\Coupon::where('reservation_id', $reservation->id)->delete();

        $reservation->delete();

        return redirect()->back()->with('success', __('Reservation successfully cancelled.'));
    }
}
