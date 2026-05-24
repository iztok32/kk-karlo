<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Models\CouponType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CouponTypeController extends Controller
{
    public function index()
    {
        $types = CouponType::orderBy('name')->get();

        return Inertia::render('Club/CouponTypes/Index', [
            'types' => $types,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255|unique:coupon_types,name',
            'price' => 'required|numeric|min:0',
        ]);

        CouponType::create($validated);

        return redirect()->back()->with('success', __('Coupon type successfully added.'));
    }

    public function update(Request $request, CouponType $couponType)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255|unique:coupon_types,name,' . $couponType->id,
            'price' => 'required|numeric|min:0',
        ]);

        $couponType->update($validated);

        return redirect()->back()->with('success', __('Coupon type successfully updated.'));
    }

    public function destroy(CouponType $couponType)
    {
        if ($couponType->coupons()->exists()) {
            return back()->withErrors(['delete' => __('Cannot delete a coupon type that has associated coupons.')]);
        }

        $couponType->delete();

        return redirect()->back()->with('success', __('Coupon type successfully deleted.'));
    }
}
