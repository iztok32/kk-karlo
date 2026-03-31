<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Horse;
use App\Models\News;
use App\Models\Reservation;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $news = News::with('images')
            ->where('is_active', true)
            ->where('is_on_auth_page', true)
            ->where(function ($q) {
                $q->whereNull('published_at')->orWhere('published_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', now());
            })
            ->orderBy('published_at', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'content' => $item->content,
                    'published_at' => $item->published_at,
                    'images' => $item->images->map(fn($img) => ['url' => $img->url])->values(),
                ];
            });

        $coupons = Coupon::with('couponType')
            ->where('user_id', $user->id)
            ->get()
            ->groupBy('coupon_type_id')
            ->map(function ($group) {
                $type = $group->first()->couponType;
                return [
                    'type_name' => $type?->name ?? '—',
                    'balance' => $group->sum('quantity'),
                ];
            })
            ->filter(fn($item) => $item['balance'] > 0)
            ->values();

        $reservations = Reservation::with(['appointment', 'horse'])
            ->where('user_id', $user->id)
            ->where('reservation_date', '>=', now()->toDateString())
            ->orderBy('reservation_date')
            ->take(5)
            ->get()
            ->map(function ($res) {
                return [
                    'id' => $res->id,
                    'reservation_date' => $res->reservation_date,
                    'appointment_name' => $res->appointment?->name,
                    'start_time' => $res->appointment ? substr($res->appointment->start_time, 0, 5) : null,
                    'end_time' => $res->appointment ? substr($res->appointment->end_time, 0, 5) : null,
                    'horse_name' => $res->horse?->name,
                ];
            });

        $horses = Horse::with('images')
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get()
            ->map(function ($horse) {
                return [
                    'id' => $horse->id,
                    'name' => $horse->name,
                    'year' => $horse->year,
                    'images' => $horse->images->map(fn($img) => [
                        'id' => $img->id,
                        'url' => $img->url,
                        'is_primary' => $img->is_primary,
                    ]),
                ];
            });

        return Inertia::render('Dashboard', [
            'news' => $news,
            'coupons' => $coupons,
            'reservations' => $reservations,
            'horses' => $horses,
        ]);
    }
}
