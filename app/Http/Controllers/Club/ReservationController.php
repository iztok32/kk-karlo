<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Horse;
use App\Models\Reservation;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $view      = $request->input('view', 'month');
        $startDate = $request->input('start');
        $endDate   = $request->input('end');

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

        $isAdmin = $this->isAdmin();
        $isTeacher = auth()->user()->hasRole('ucitelj');

        // Appointment IDs where current user is assigned as teacher
        $myTeacherAppointmentIds = $isTeacher
            ? \DB::table('appointment_teacher')
                ->where('user_id', auth()->id())
                ->pluck('appointment_id')
                ->toArray()
            : [];

        // Enabled notification channels
        $enabledChannels = array_filter([
            config('notifications.enable_portal', true) ? 'portal' : null,
            config('notifications.enable_email', true)  ? 'email'  : null,
            config('notifications.enable_sms', true)    ? 'sms'    : null,
        ]);

        return Inertia::render('Club/Reservations/Index', [
            'appointments'             => $appointments,
            'reservations'             => $reservations,
            'horses'                   => $horses,
            'users'                    => $users,
            'canReserveForOthers'      => $canReserveForOthers,
            'startDate'                => $startDate,
            'endDate'                  => $endDate,
            'currentView'              => $view,
            'authUserId'               => auth()->id(),
            'myUpcoming'               => $myUpcoming,
            'reservationLimits'        => [
                'minDaysInAdvance' => $isAdmin ? 0 : Setting::get('reservation.min_days_in_advance', 0),
                'maxDaysInAdvance' => $isAdmin ? null : Setting::get('reservation.max_days_in_advance', 14),
                'isAdmin'          => $isAdmin,
            ],
            'canNotifySlots'           => $isAdmin || $isTeacher,
            'myTeacherAppointmentIds'  => $myTeacherAppointmentIds,
            'enabledChannels'          => array_values($enabledChannels),
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

        // Check min/max days in advance for non-admin users
        if (! $this->isAdmin()) {
            $date    = Carbon::parse($validated['reservation_date'])->startOfDay();
            $today   = Carbon::today();
            $daysAhead = $today->diffInDays($date, false);

            $minDays = (int) Setting::get('reservation.min_days_in_advance', 0);
            $maxDays = (int) Setting::get('reservation.max_days_in_advance', 14);

            if ($daysAhead < $minDays) {
                $msg = $minDays === 0
                    ? __('Reservations cannot be made for past dates.')
                    : trans_choice(
                        'You can only make a reservation at least :count day in advance.|You can only make a reservation at least :count days in advance.',
                        $minDays,
                        ['count' => $minDays]
                    );
                return back()->withErrors(['reservation_date' => $msg]);
            }

            if ($daysAhead > $maxDays) {
                $msg = trans_choice(
                    'You can only make a reservation up to :count day in advance.|You can only make a reservation up to :count days in advance.',
                    $maxDays,
                    ['count' => $maxDays]
                );
                return back()->withErrors(['reservation_date' => $msg]);
            }
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
            ->havingRaw("SUM(CASE WHEN transaction_type = 'purchase' THEN quantity ELSE -quantity END) > 0")
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

    private function isAdmin(): bool
    {
        $user = auth()->user();
        return $user->hasRole('admin') || $user->hasRole('superadmin');
    }
}
