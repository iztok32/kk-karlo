<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Coupon;
use App\Models\Horse;
use App\Models\Notification;
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

        $allowedTypeIds = auth()->user()->allowedAppointmentTypeIds();

        $appointments = Appointment::with('teachers:id,name')
            ->where('is_active', true)
            ->when(!empty($allowedTypeIds), fn($q) => $q->whereIn('type', $allowedTypeIds))
            ->orderBy('start_time')
            ->orderBy('name')
            ->get();

        $appointmentTypes = \App\Models\AppointmentType::whereNull('deleted_at')
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get(['id', 'name', 'horses_selectable', 'coupon_type_id']);

        $reservations = Reservation::with(['user:id,name', 'horse:id,name', 'createdBy:id,name'])
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

        // Coupon balances: { userId: { couponTypeId: balance } }
        $couponBalanceRows = \DB::table('coupons')
            ->selectRaw("user_id, coupon_type_id, SUM(CASE WHEN transaction_type = 'purchase' THEN quantity ELSE -quantity END) as balance")
            ->whereNull('deleted_at')
            ->when(! $canReserveForOthers, fn ($q) => $q->where('user_id', auth()->id()))
            ->groupBy('user_id', 'coupon_type_id')
            ->havingRaw("SUM(CASE WHEN transaction_type = 'purchase' THEN quantity ELSE -quantity END) > 0")
            ->get();

        $couponBalances = [];
        foreach ($couponBalanceRows as $row) {
            $couponBalances[$row->user_id][$row->coupon_type_id] = (int) $row->balance;
        }

        $isAdmin = $this->isAdmin();

        // Teacher status derived from pivot, not role — admins can also be teachers
        $myTeacherAppointmentIds = \DB::table('appointment_teacher')
            ->where('user_id', auth()->id())
            ->pluck('appointment_id')
            ->toArray();

        $isTeacher = ! empty($myTeacherAppointmentIds);

        // Enabled notification channels
        $enabledChannels = array_filter([
            config('notifications.enable_portal', true) ? 'portal' : null,
            config('notifications.enable_email', true)  ? 'email'  : null,
            config('notifications.enable_sms', true)    ? 'sms'    : null,
        ]);

        $holidays = \App\Models\Holiday::whereBetween('date', [$startDate, $endDate])
            ->get(['date', 'name', 'local_name', 'country_code'])
            ->map(fn($h) => [
                'date'         => $h->date->format('Y-m-d'),
                'name'         => $h->name,
                'local_name'   => $h->local_name,
                'country_code' => $h->country_code,
            ]);

        return Inertia::render('Club/Reservations/Index', [
            'appointments'             => $appointments,
            'appointmentTypes'         => $appointmentTypes,
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
                'minDaysInAdvance'  => $isAdmin ? 0 : Setting::get('reservation.min_days_in_advance', 0),
                'maxDaysInAdvance'  => $isAdmin ? null : Setting::get('reservation.max_days_in_advance', 14),
                'cancellationDays'  => $isAdmin ? null : (int) Setting::get('reservation.cancellation_days', 2),
                'isAdmin'           => $isAdmin,
            ],
            'defaultAdmins'            => $this->getDefaultAdmins(),
            'canNotifySlots'           => $isAdmin || $isTeacher,
            'myTeacherAppointmentIds'  => $myTeacherAppointmentIds,
            'enabledChannels'          => array_values($enabledChannels),
            'holidays'                 => $holidays->values(),
            'couponBalances'           => $couponBalances,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Reservation store request:', $request->all());

        $canReserveForOthers = auth()->user()->hasPermission('reservations.reserve-for-others');

        $rules = [
            'appointment_id'   => 'required|exists:appointments,id',
            'horse_id'         => 'nullable|exists:horses,id',
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

        // Check coupon balance for the target user if appointment type requires a coupon
        $appointmentType = \App\Models\AppointmentType::find($appointment->type);
        $requiredCouponTypeId = $appointmentType?->coupon_type_id;

        if ($requiredCouponTypeId) {
            $balance = \Illuminate\Support\Facades\DB::table('coupons')
                ->selectRaw("SUM(CASE WHEN transaction_type = 'purchase' THEN quantity ELSE -quantity END) as balance")
                ->where('user_id', $validated['user_id'])
                ->where('coupon_type_id', $requiredCouponTypeId)
                ->whereNull('deleted_at')
                ->value('balance');

            if (! $balance || $balance < 1) {
                return back()->withErrors(['coupon' => __('The user does not have a required coupon for this appointment type.')]);
            }
        }

        $validated['created_by_user_id'] = auth()->id();
        $reservation = Reservation::create($validated);

        // Deduct coupon if required
        if ($requiredCouponTypeId) {
            Coupon::create([
                'user_id'          => $validated['user_id'],
                'coupon_type_id'   => $requiredCouponTypeId,
                'quantity'         => 1,
                'transaction_type' => 'usage',
                'reservation_id'   => $reservation->id,
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

        // Non-admins: check cancellation deadline
        if (! $this->isAdmin()) {
            $cancellationDays = (int) Setting::get('reservation.cancellation_days', 2);
            $daysUntil = Carbon::today()->diffInDays(
                Carbon::parse($reservation->reservation_date)->startOfDay(),
                false
            );

            if ($daysUntil < $cancellationDays) {
                return back()->withErrors(['cancellation_deadline' => __('The cancellation deadline has passed.')]);
            }
        }

        // Refund coupon
        Coupon::where('reservation_id', $reservation->id)->delete();

        $reservation->delete();

        return redirect()->back()->with('success', __('Reservation successfully cancelled.'));
    }

    public function notifyLateCancellation(Reservation $reservation)
    {
        // Only own reservation (or admin)
        if (! $this->isAdmin() && $reservation->user_id !== auth()->id()) {
            abort(403, __('Unauthorized.'));
        }

        $reservation->loadMissing('appointment.teachers');
        $appointment = $reservation->appointment;

        $recipientIds = $appointment->teachers->pluck('id')->toArray();

        // Fall back to default admins from settings
        if (empty($recipientIds)) {
            $raw = Setting::get('general.default_admin_ids', '[]');
            $recipientIds = json_decode($raw, true) ?? [];
        }

        if (empty($recipientIds)) {
            return back()->withErrors(['notification' => __('No recipients found. Please configure default administrators in settings.')]);
        }

        $user            = auth()->user();
        $reservationDate = Carbon::parse($reservation->reservation_date)->format('d.m.Y');
        $subject         = __('Late cancellation request');
        $message         = __(':user is requesting late cancellation of the reservation on :date for appointment :appointment.', [
            'user'        => $user->name,
            'date'        => $reservationDate,
            'appointment' => $appointment->name,
        ]);

        foreach ($recipientIds as $recipientId) {
            Notification::create([
                'sender_id'    => auth()->id(),
                'recipient_id' => $recipientId,
                'type'         => 'portal',
                'subject'      => $subject,
                'message'      => $message,
                'status'       => 'sent',
                'sent_at'      => now(),
            ]);
        }

        return back()->with('success', __('Notification sent successfully.'));
    }

    private function isAdmin(): bool
    {
        $user = auth()->user();
        return $user->hasRole('admin') || $user->hasRole('superadmin');
    }

    private function getDefaultAdmins(): array
    {
        $ids = json_decode(Setting::get('general.default_admin_ids', '[]'), true) ?? [];
        if (empty($ids)) return [];
        return User::whereIn('id', $ids)->get(['id', 'name'])->toArray();
    }
}
