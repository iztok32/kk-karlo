<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Models\HorsemanType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class HorsemanController extends Controller
{
    public function index()
    {
        return Inertia::render('Club/Horseman/Index', [
            'horsemanTypes' => HorsemanType::orderBy('display_order')->orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        Log::info('HorsemanType store request:', $request->all());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        if (!isset($validated['is_active'])) {
            $validated['is_active'] = $request->boolean('is_active');
        }

        $validated['display_order'] = HorsemanType::max('display_order') + 1;

        HorsemanType::create($validated);

        return redirect()->back()->with('success', __('Horseman type successfully added.'));
    }

    public function update(Request $request, HorsemanType $horseman)
    {
        Log::info('HorsemanType update request:', $request->all());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        if (!isset($validated['is_active'])) {
            $validated['is_active'] = $request->boolean('is_active');
        }

        $horseman->update($validated);

        return redirect()->back()->with('success', __('Horseman type successfully updated.'));
    }

    public function destroy(HorsemanType $horseman)
    {
        $horseman->delete();

        return redirect()->back()->with('success', __('Horseman type successfully deleted.'));
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:horseman_type,id',
        ]);

        foreach ($request->ids as $index => $id) {
            HorsemanType::where('id', $id)->update(['display_order' => $index]);
        }

        return redirect()->back()->with('success', __('Order successfully updated.'));
    }
}
