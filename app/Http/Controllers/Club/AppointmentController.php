<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AppointmentType;
use App\Models\Horse;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function index()
    {
        $appointments = Appointment::with('horses:id', 'teachers:id')
            ->orderBy('display_order')
            ->orderBy('name')
            ->get()
            ->map(fn($a) => [
                'id'            => $a->id,
                'name'          => $a->name,
                'valid_from'    => $a->valid_from,
                'valid_to'      => $a->valid_to,
                'day_monday'    => $a->day_monday,
                'day_tuesday'   => $a->day_tuesday,
                'day_wednesday' => $a->day_wednesday,
                'day_thursday'  => $a->day_thursday,
                'day_friday'    => $a->day_friday,
                'day_saturday'  => $a->day_saturday,
                'day_sunday'    => $a->day_sunday,
                'start_time'    => $a->start_time,
                'end_time'      => $a->end_time,
                'capacity'      => $a->capacity,
                'type'          => $a->type,
                'display_order' => $a->display_order,
                'is_active'     => $a->is_active,
                'horse_ids'     => $a->horses->pluck('id')->toArray(),
                'teacher_ids'   => $a->teachers->pluck('id')->toArray(),
            ]);

        $horses = Horse::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $teachers = User::where('is_active', true)
            ->whereNull('deleted_at')
            ->whereHas('roles', fn($q) => $q->where('slug', 'ucitelj'))
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Club/Appointment/Index', [
            'appointments' => $appointments,
            'horses'       => $horses,
            'teachers'     => $teachers,
        ]);
    }

    public function store(Request $request)
    {
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
            'horse_ids'      => 'nullable|array',
            'horse_ids.*'    => 'exists:horses,id',
            'teacher_ids'    => 'nullable|array',
            'teacher_ids.*'  => 'exists:users,id',
        ]);

        $horseIds   = $validated['horse_ids'] ?? [];
        $teacherIds = $validated['teacher_ids'] ?? [];
        unset($validated['horse_ids'], $validated['teacher_ids']);

        $validated['display_order'] = Appointment::max('display_order') + 1;

        $appointment = Appointment::create($validated);
        $appointment->horses()->sync($horseIds);
        $appointment->teachers()->sync($teacherIds);

        return redirect()->back()->with('success', __('Appointment successfully added.'));
    }

    public function update(Request $request, Appointment $appointment)
    {
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
            'horse_ids'      => 'nullable|array',
            'horse_ids.*'    => 'exists:horses,id',
            'teacher_ids'    => 'nullable|array',
            'teacher_ids.*'  => 'exists:users,id',
        ]);

        $horseIds   = $validated['horse_ids'] ?? [];
        $teacherIds = $validated['teacher_ids'] ?? [];
        unset($validated['horse_ids'], $validated['teacher_ids']);

        $appointment->update($validated);
        $appointment->horses()->sync($horseIds);
        $appointment->teachers()->sync($teacherIds);

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
