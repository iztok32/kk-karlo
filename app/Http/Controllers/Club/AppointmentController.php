<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function index()
    {
        return Inertia::render('Club/Appointment/Index', [
            'appointments' => Appointment::orderBy('display_order')->orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Appointment store request:', $request->all());

        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'valid_from'    => 'nullable|date',
            'valid_to'      => 'nullable|date|after_or_equal:valid_from',
            'day_monday'    => 'boolean',
            'day_tuesday'   => 'boolean',
            'day_wednesday' => 'boolean',
            'day_thursday'  => 'boolean',
            'day_friday'    => 'boolean',
            'day_saturday'  => 'boolean',
            'day_sunday'    => 'boolean',
            'start_time'    => 'nullable|date_format:H:i',
            'end_time'      => 'nullable|date_format:H:i',
            'capacity'      => 'nullable|integer|min:1',
            'type'          => 'nullable|integer',
            'is_active'     => 'boolean',
        ]);

        $validated['display_order'] = Appointment::max('display_order') + 1;

        Appointment::create($validated);

        return redirect()->back()->with('success', __('Appointment successfully added.'));
    }

    public function update(Request $request, Appointment $appointment)
    {
        Log::info('Appointment update request:', $request->all());

        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'valid_from'    => 'nullable|date',
            'valid_to'      => 'nullable|date|after_or_equal:valid_from',
            'day_monday'    => 'boolean',
            'day_tuesday'   => 'boolean',
            'day_wednesday' => 'boolean',
            'day_thursday'  => 'boolean',
            'day_friday'    => 'boolean',
            'day_saturday'  => 'boolean',
            'day_sunday'    => 'boolean',
            'start_time'    => 'nullable|date_format:H:i',
            'end_time'      => 'nullable|date_format:H:i',
            'capacity'      => 'nullable|integer|min:1',
            'type'          => 'nullable|integer',
            'is_active'     => 'boolean',
        ]);

        $appointment->update($validated);

        return redirect()->back()->with('success', __('Appointment successfully updated.'));
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return redirect()->back()->with('success', __('Appointment successfully deleted.'));
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'exists:appointments,id',
        ]);

        foreach ($request->ids as $index => $id) {
            Appointment::where('id', $id)->update(['display_order' => $index]);
        }

        return redirect()->back()->with('success', __('Order successfully updated.'));
    }
}
