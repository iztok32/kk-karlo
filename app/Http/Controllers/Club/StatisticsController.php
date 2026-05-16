<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Coupon;
use App\Models\Horse;
use App\Models\PageVisit;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->input('period', 'month');

        [$from, $to] = $this->resolvePeriod($period, $request);

        $fromStr = $from->toDateString();
        $toStr   = $to->toDateString();

        return Inertia::render('Club/Statistics/Index', [
            'period'       => $period,
            'from'         => $fromStr,
            'to'           => $toStr,
            'reservations' => $this->reservationStats($from, $to),
            'appointments' => $this->appointmentStats($from, $to),
            'coupons'      => $this->couponStats($from, $to),
            'users'        => $this->userStats($from, $to),
            'horses'       => $this->horseStats($from, $to),
            'visits'       => $this->visitStats($from, $to),
            'trend'        => $this->reservationTrend($from, $to),
            'couponTrend'  => $this->couponTrend($from, $to),
        ]);
    }

    // ── Period ─────────────────────────────────────────────────────────────────

    private function resolvePeriod(string $period, Request $request): array
    {
        return match ($period) {
            'week'   => [Carbon::now()->startOfWeek(Carbon::MONDAY), Carbon::now()->endOfWeek(Carbon::SUNDAY)],
            'month'  => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            'year'   => [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()],
            'custom' => [
                Carbon::parse($request->input('from', Carbon::now()->startOfMonth())),
                Carbon::parse($request->input('to',   Carbon::now()->endOfMonth())),
            ],
            default  => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
        };
    }

    // ── Reservations ───────────────────────────────────────────────────────────

    private function reservationStats(Carbon $from, Carbon $to): array
    {
        $base = Reservation::whereBetween('reservation_date', [$from->toDateString(), $to->toDateString()]);

        $total     = (clone $base)->withTrashed()->count();
        $active    = (clone $base)->whereNull('deleted_at')->count();
        $cancelled = (clone $base)->onlyTrashed()->count();
        $cancelRate = $total > 0 ? round($cancelled / $total * 100, 1) : 0;

        // Zasedenost: rezervacije / skupna kapaciteta terminov v obdobju
        $capacityData = $this->totalCapacityInPeriod($from, $to);
        $occupancy = $capacityData['total_capacity'] > 0
            ? round($active / $capacityData['total_capacity'] * 100, 1)
            : 0;

        // Termini s 100% zasedenostjo
        $fullSlots = Reservation::select('appointment_id', 'reservation_date', DB::raw('COUNT(*) as cnt'))
            ->whereBetween('reservation_date', [$from->toDateString(), $to->toDateString()])
            ->whereNull('deleted_at')
            ->groupBy('appointment_id', 'reservation_date')
            ->get()
            ->filter(function ($row) {
                $appt = Appointment::find($row->appointment_id);
                return $appt && $appt->capacity && $row->cnt >= $appt->capacity;
            })
            ->count();

        // Top termini po rezervacijah
        $topAppointments = Reservation::select(
                'appointment_id',
                DB::raw('COUNT(*) as total')
            )
            ->whereBetween('reservation_date', [$from->toDateString(), $to->toDateString()])
            ->whereNull('deleted_at')
            ->groupBy('appointment_id')
            ->orderByDesc('total')
            ->limit(8)
            ->with('appointment:id,name,start_time,end_time,capacity')
            ->get()
            ->map(fn($r) => [
                'name'     => $r->appointment?->name ?? 'N/A',
                'time'     => $r->appointment?->start_time
                    ? substr($r->appointment->start_time, 0, 5)
                      . ($r->appointment->end_time ? '–' . substr($r->appointment->end_time, 0, 5) : '')
                    : '',
                'total'    => $r->total,
                'capacity' => $r->appointment?->capacity,
            ]);

        // Rezervacije po dneh v tednu
        $byDayOfWeek = Reservation::selectRaw(
                "EXTRACT(DOW FROM reservation_date::date)::int AS dow, COUNT(*) AS cnt"
            )
            ->whereBetween('reservation_date', [$from->toDateString(), $to->toDateString()])
            ->whereNull('deleted_at')
            ->groupBy('dow')
            ->pluck('cnt', 'dow')
            ->toArray();

        $days = ['Ned', 'Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob'];
        $byDay = array_map(fn($i) => [
            'day'   => $days[$i],
            'count' => (int) ($byDayOfWeek[$i] ?? 0),
        ], range(0, 6));

        return [
            'total'           => $total,
            'active'          => $active,
            'cancelled'       => $cancelled,
            'cancel_rate'     => $cancelRate,
            'occupancy'       => $occupancy,
            'full_slots'      => $fullSlots,
            'top_appointments'=> $topAppointments,
            'by_day_of_week'  => $byDay,
            'capacity_slots'  => $capacityData['slot_count'],
        ];
    }

    private function totalCapacityInPeriod(Carbon $from, Carbon $to): array
    {
        $appointments = Appointment::where('is_active', true)
            ->whereNotNull('capacity')
            ->get();

        $days        = collect();
        $current     = $from->copy();
        while ($current->lte($to)) {
            $days->push($current->copy());
            $current->addDay();
        }

        $slotCount      = 0;
        $totalCapacity  = 0;
        foreach ($appointments as $appt) {
            foreach ($days as $day) {
                $dayKey = ['day_sunday','day_monday','day_tuesday','day_wednesday','day_thursday','day_friday','day_saturday'][$day->dayOfWeek];
                if (!$appt->$dayKey) continue;
                if ($appt->valid_from && $day->lt(Carbon::parse($appt->valid_from))) continue;
                if ($appt->valid_to   && $day->gt(Carbon::parse($appt->valid_to)))   continue;
                $slotCount++;
                $totalCapacity += $appt->capacity;
            }
        }

        return ['slot_count' => $slotCount, 'total_capacity' => $totalCapacity];
    }

    // ── Appointments ───────────────────────────────────────────────────────────

    private function appointmentStats(Carbon $from, Carbon $to): array
    {
        $active = Appointment::where('is_active', true)->count();

        // Termini ki so veljavni v tem obdobju
        $inPeriod = Appointment::where('is_active', true)
            ->where(function ($q) use ($from, $to) {
                $q->whereNull('valid_from')->orWhere('valid_from', '<=', $to->toDateString());
            })
            ->where(function ($q) use ($from, $to) {
                $q->whereNull('valid_to')->orWhere('valid_to', '>=', $from->toDateString());
            })
            ->count();

        // Zasedenost po terminu
        $occupancyByAppt = Reservation::select(
                'appointment_id',
                DB::raw('COUNT(*) as reservations')
            )
            ->whereBetween('reservation_date', [$from->toDateString(), $to->toDateString()])
            ->whereNull('deleted_at')
            ->groupBy('appointment_id')
            ->with('appointment:id,name,capacity')
            ->get()
            ->filter(fn($r) => $r->appointment?->capacity)
            ->map(fn($r) => [
                'name'         => $r->appointment->name,
                'reservations' => $r->reservations,
                'capacity_total' => $r->appointment->capacity, // na en slot
                'occupancy'    => round($r->reservations / max($r->appointment->capacity, 1) * 100, 0),
            ])
            ->sortByDesc('reservations')
            ->values();

        return [
            'total_active'    => $active,
            'in_period'       => $inPeriod,
            'occupancy_detail'=> $occupancyByAppt,
        ];
    }

    // ── Coupons ────────────────────────────────────────────────────────────────

    private function couponStats(Carbon $from, Carbon $to): array
    {
        $inPeriod = Coupon::whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])
            ->whereNull('deleted_at');

        $purchased = (clone $inPeriod)->where('transaction_type', 'purchase')->sum('quantity');
        $used      = (clone $inPeriod)->where('transaction_type', 'usage')->sum('quantity');

        $online = (clone $inPeriod)
            ->where('transaction_type', 'purchase')
            ->whereNotNull('stripe_payment_intent_id')
            ->sum('quantity');

        $manual = (clone $inPeriod)
            ->where('transaction_type', 'purchase')
            ->whereNull('stripe_payment_intent_id')
            ->sum('quantity');

        $revenue = (clone $inPeriod)
            ->where('transaction_type', 'purchase')
            ->whereNotNull('stripe_payment_intent_id')
            ->sum('price_paid');

        // Skupno stanje vseh kuponov (all time)
        $balanceAll = Coupon::whereNull('deleted_at')
            ->selectRaw("SUM(CASE WHEN transaction_type = 'purchase' THEN quantity ELSE -quantity END) as balance")
            ->value('balance') ?? 0;

        return [
            'purchased'  => (int) $purchased,
            'used'       => (int) $used,
            'online'     => (int) $online,
            'manual'     => (int) $manual,
            'revenue'    => round((float) $revenue, 2),
            'balance_all'=> (int) $balanceAll,
        ];
    }

    // ── Users ──────────────────────────────────────────────────────────────────

    private function userStats(Carbon $from, Carbon $to): array
    {
        $totalActive  = User::where('is_active', true)->count();
        $totalMembers = User::where('is_active', true)->where('is_member', true)->count();

        $newInPeriod = User::whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])->count();

        // Top 10 po rezervacijah v obdobju
        $topUsers = Reservation::select('user_id', DB::raw('COUNT(*) as total'))
            ->whereBetween('reservation_date', [$from->toDateString(), $to->toDateString()])
            ->whereNull('deleted_at')
            ->groupBy('user_id')
            ->orderByDesc('total')
            ->limit(10)
            ->with('user:id,name')
            ->get()
            ->map(fn($r) => [
                'name'  => $r->user?->name ?? 'N/A',
                'total' => $r->total,
            ]);

        return [
            'total_active'  => $totalActive,
            'total_members' => $totalMembers,
            'new_in_period' => $newInPeriod,
            'top_users'     => $topUsers,
        ];
    }

    // ── Horses ─────────────────────────────────────────────────────────────────

    private function horseStats(Carbon $from, Carbon $to): array
    {
        $topHorses = Reservation::select('horse_id', DB::raw('COUNT(*) as total'))
            ->whereBetween('reservation_date', [$from->toDateString(), $to->toDateString()])
            ->whereNull('deleted_at')
            ->groupBy('horse_id')
            ->orderByDesc('total')
            ->limit(10)
            ->with('horse:id,name')
            ->get()
            ->map(fn($r) => [
                'name'  => $r->horse?->name ?? 'N/A',
                'total' => $r->total,
            ]);

        return [
            'top_horses' => $topHorses,
        ];
    }

    // ── Page Visits ────────────────────────────────────────────────────────────

    private function visitStats(Carbon $from, Carbon $to): array
    {
        $base = PageVisit::whereBetween('visited_at', [$from->startOfDay(), $to->endOfDay()]);

        $totalViews      = (clone $base)->count();
        $uniqueSessions  = (clone $base)->distinct('session_id')->count('session_id');
        $uniqueUsers     = (clone $base)->whereNotNull('user_id')->distinct('user_id')->count('user_id');
        $guestViews      = (clone $base)->whereNull('user_id')->count();

        $topPages = (clone $base)
            ->select('route_name', DB::raw('COUNT(*) as cnt'))
            ->whereNotNull('route_name')
            ->groupBy('route_name')
            ->orderByDesc('cnt')
            ->limit(8)
            ->pluck('cnt', 'route_name')
            ->map(fn($cnt, $route) => ['route' => $route, 'count' => $cnt])
            ->values();

        return [
            'total_views'     => $totalViews,
            'unique_sessions' => $uniqueSessions,
            'unique_users'    => $uniqueUsers,
            'guest_views'     => $guestViews,
            'top_pages'       => $topPages,
        ];
    }

    // ── Trends ─────────────────────────────────────────────────────────────────

    private function reservationTrend(Carbon $from, Carbon $to): array
    {
        $days = $to->diffInDays($from);
        $groupBy = $days <= 31 ? 'day' : ($days <= 90 ? 'week' : 'month');

        if ($groupBy === 'day') {
            $format = 'YYYY-MM-DD';
            $label  = 'DD. MM.';
        } elseif ($groupBy === 'week') {
            $format = 'IYYY-IW';
            $label  = 'IW/IYYY';
        } else {
            $format = 'YYYY-MM';
            $label  = 'MM/YYYY';
        }

        $rows = Reservation::selectRaw(
                "TO_CHAR(reservation_date::date, '{$format}') as period,
                 COUNT(*) FILTER (WHERE deleted_at IS NULL) as active,
                 COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as cancelled"
            )
            ->whereBetween('reservation_date', [$from->toDateString(), $to->toDateString()])
            ->withTrashed()
            ->groupByRaw("TO_CHAR(reservation_date::date, '{$format}')")
            ->orderByRaw("TO_CHAR(reservation_date::date, '{$format}')")
            ->get()
            ->map(fn($r) => [
                'period'    => $r->period,
                'active'    => (int) $r->active,
                'cancelled' => (int) $r->cancelled,
            ]);

        return $rows->values()->toArray();
    }

    private function couponTrend(Carbon $from, Carbon $to): array
    {
        $days   = $to->diffInDays($from);
        $format = $days <= 31 ? 'YYYY-MM-DD' : 'YYYY-MM';

        $rows = Coupon::selectRaw(
                "TO_CHAR(created_at AT TIME ZONE 'UTC', '{$format}') as period,
                 SUM(CASE WHEN transaction_type = 'purchase' THEN quantity ELSE 0 END) as purchased,
                 SUM(CASE WHEN transaction_type = 'usage'    THEN quantity ELSE 0 END) as used"
            )
            ->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])
            ->whereNull('deleted_at')
            ->groupByRaw("TO_CHAR(created_at AT TIME ZONE 'UTC', '{$format}')")
            ->orderByRaw("TO_CHAR(created_at AT TIME ZONE 'UTC', '{$format}')")
            ->get()
            ->map(fn($r) => [
                'period'    => $r->period,
                'purchased' => (int) $r->purchased,
                'used'      => (int) $r->used,
            ]);

        return $rows->values()->toArray();
    }
}
