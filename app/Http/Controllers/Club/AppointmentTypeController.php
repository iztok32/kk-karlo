<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Models\AppointmentType;
use App\Models\CouponType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppointmentTypeController extends Controller
{
    public function index()
    {
        $types = AppointmentType::withTrashed()
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        $couponTypes = CouponType::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Club/AppointmentType/Index', [
            'types'       => $types,
            'couponTypes' => $couponTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'is_active'         => 'boolean',
            'horses_selectable' => 'boolean',
            'coupon_type_id'    => 'nullable|exists:coupon_types,id',
        ]);

        $validated['display_order'] = AppointmentType::max('display_order') + 1;

        AppointmentType::create($validated);

        return redirect()->back()->with('success', __('Appointment type successfully added.'));
    }

    public function update(Request $request, AppointmentType $appointmentType)
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'is_active'         => 'boolean',
            'horses_selectable' => 'boolean',
            'coupon_type_id'    => 'nullable|exists:coupon_types,id',
        ]);

        $appointmentType->update($validated);

        return redirect()->back()->with('success', __('Appointment type successfully updated.'));
    }

    public function destroy(AppointmentType $appointmentType)
    {
        $appointmentType->delete();

        return redirect()->back()->with('success', __('Appointment type successfully deleted.'));
    }

    public function restore(int $id)
    {
        $type = AppointmentType::withTrashed()->findOrFail($id);
        $type->restore();

        return redirect()->back()->with('success', __('Appointment type successfully restored.'));
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'integer',
        ]);

        foreach ($request->ids as $index => $id) {
            AppointmentType::where('id', $id)->update(['display_order' => $index]);
        }

        return redirect()->back()->with('success', __('Order successfully updated.'));
    }
}
