<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Models\Horse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class HorseController extends Controller
{
    public function index()
    {
        return Inertia::render('Club/Horses/Index', [
            'horses' => Horse::orderBy('display_order')->orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        \Log::info('Horse store request:', $request->all());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'year' => 'required|numeric|min:1900',
            'display_order' => 'nullable|numeric',
            'is_active' => 'sometimes',
        ]);

        if (!isset($validated['is_active'])) {
            $validated['is_active'] = $request->boolean('is_active');
        }

        Horse::create($validated);

        return redirect()->back()->with('success', 'Konj uspešno dodan.');
    }

    public function update(Request $request, Horse $horse)
    {
        \Log::info('Horse update request:', $request->all());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'year' => 'required|numeric|min:1900',
            'display_order' => 'nullable|numeric',
            'is_active' => 'sometimes',
        ]);

        if (!isset($validated['is_active'])) {
            $validated['is_active'] = $request->boolean('is_active');
        }

        $horse->update($validated);

        return redirect()->back()->with('success', 'Podatki o konju uspešno posodobljeni.');
    }

    public function destroy(Horse $horse)
    {
        $horse->delete();

        return redirect()->back()->with('success', 'Konj uspešno izbrisan.');
    }
}
