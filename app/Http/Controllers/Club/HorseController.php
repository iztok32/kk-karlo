<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Models\Horse;
use App\Models\HorseImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HorseController extends Controller
{
    public function index()
    {
        $horses = Horse::with('images')->orderBy('display_order')->orderBy('name')->get()->map(function ($horse) {
            return [
                'id' => $horse->id,
                'name' => $horse->name,
                'year' => $horse->year,
                'display_order' => $horse->display_order,
                'is_active' => $horse->is_active,
                'created_at' => $horse->created_at,
                'images' => $horse->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->url,
                        'is_primary' => $image->is_primary,
                        'display_order' => $image->display_order,
                    ];
                }),
            ];
        });

        return Inertia::render('Club/Horses/Index', [
            'horses' => $horses
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Horse store request:', $request->all());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'year' => 'required|numeric|min:1900',
            'is_active' => 'sometimes',
        ]);

        if (!isset($validated['is_active'])) {
            $validated['is_active'] = $request->boolean('is_active');
        }

        // Set display_order to the next available value
        $validated['display_order'] = Horse::max('display_order') + 1;

        Horse::create($validated);

        return redirect()->back()->with('success', __('Horse successfully added.'));
    }

    public function update(Request $request, Horse $horse)
    {
        Log::info('Horse update request:', $request->all());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'year' => 'required|numeric|min:1900',
            'is_active' => 'sometimes',
        ]);

        if (!isset($validated['is_active'])) {
            $validated['is_active'] = $request->boolean('is_active');
        }

        $horse->update($validated);

        return redirect()->back()->with('success', __('Horse data successfully updated.'));
    }

    public function destroy(Horse $horse)
    {
        $horse->delete();

        return redirect()->back()->with('success', __('Horse successfully deleted.'));
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:horses,id',
        ]);

        foreach ($request->ids as $index => $id) {
            Horse::where('id', $id)->update(['display_order' => $index]);
        }

        return redirect()->back()->with('success', __('Order successfully updated.'));
    }

    /**
     * Upload images for a horse
     */
    public function uploadImages(Request $request, Horse $horse)
    {
        $request->validate([
            'images' => 'required|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120', // max 5MB per image
        ]);

        $uploadedCount = 0;

        foreach ($request->file('images') as $image) {
            $path = $image->store('horses/' . $horse->id, 'public');

            $horse->images()->create([
                'path' => $path,
                'display_order' => $horse->images()->max('display_order') + 1,
                'is_primary' => $horse->images()->count() === 0, // First image is primary
            ]);

            $uploadedCount++;
        }

        return redirect()->back()->with('success', __('Images uploaded successfully.') . ' (' . $uploadedCount . ')');
    }

    /**
     * Delete a horse image
     */
    public function deleteImage(HorseImage $image)
    {
        $wasPrimary = $image->is_primary;
        $horseId = $image->horse_id;

        $image->delete();

        // If deleted image was primary, set the first remaining image as primary
        if ($wasPrimary) {
            $firstImage = HorseImage::where('horse_id', $horseId)->orderBy('display_order')->first();
            if ($firstImage) {
                $firstImage->update(['is_primary' => true]);
            }
        }

        return redirect()->back()->with('success', __('Image deleted successfully.'));
    }

    /**
     * Set primary image for a horse
     */
    public function setPrimaryImage(Horse $horse, HorseImage $image)
    {
        // Verify that the image belongs to this horse
        if ($image->horse_id !== $horse->id) {
            return redirect()->back()->withErrors(['error' => 'Invalid image for this horse.']);
        }

        // Remove primary from all other images
        $horse->images()->update(['is_primary' => false]);

        // Set this image as primary
        $image->update(['is_primary' => true]);

        return redirect()->back()->with('success', __('Primary image set successfully.'));
    }

    /**
     * Reorder horse images
     */
    public function reorderImages(Request $request, Horse $horse)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:horse_images,id',
        ]);

        foreach ($request->ids as $index => $id) {
            HorseImage::where('id', $id)
                ->where('horse_id', $horse->id) // Security check
                ->update(['display_order' => $index]);
        }

        return redirect()->back()->with('success', __('Image order updated successfully.'));
    }
}
