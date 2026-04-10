<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CouponType;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::orderBy('group')->orderBy('key')->get();

        $adminUsers = User::whereHas('roles', fn($q) => $q->whereIn('slug', ['admin', 'superadmin']))
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $couponTypes = CouponType::orderBy('name')->get(['id', 'name', 'price']);

        return Inertia::render('Admin/Settings/Index', [
            'settings'    => $settings,
            'adminUsers'  => $adminUsers,
            'couponTypes' => $couponTypes,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings'              => 'required|array',
            'settings.*.key'        => 'required|string|exists:settings,key',
            'settings.*.value'      => 'nullable',
            'coupon_type_prices'    => 'nullable|array',
            'coupon_type_prices.*'  => 'nullable|numeric|min:0',
        ]);

        foreach ($request->settings as $item) {
            Setting::set($item['key'], $item['value']);
        }

        if ($request->has('coupon_type_prices')) {
            foreach ($request->coupon_type_prices as $typeId => $price) {
                CouponType::where('id', (int) $typeId)
                    ->update(['price' => round((float) $price, 2)]);
            }
        }

        return redirect()->back()->with('success', __('Settings saved successfully.'));
    }
}
