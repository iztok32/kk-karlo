<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Models\News;
use App\Models\NewsImage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NewsController extends Controller
{
    public function index()
    {
        $news = News::with('images')->orderBy('published_at', 'desc')->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'title' => $item->title,
                'content' => $item->content,
                'published_at' => $item->published_at,
                'end_date' => $item->end_date,
                'is_on_auth_page' => $item->is_on_auth_page,
                'is_on_public_page' => $item->is_on_public_page,
                'is_active' => $item->is_active,
                'images' => $item->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->url,
                        'is_primary' => $image->is_primary,
                        'display_order' => $image->display_order,
                    ];
                }),
            ];
        });

        return Inertia::render('Club/News/Index', [
            'news' => $news,
        ]);
    }

    public function create()
    {
        return Inertia::render('Club/News/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'published_at' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:published_at',
            'is_on_auth_page' => 'boolean',
            'is_on_public_page' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if (empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $news = News::create($validated);

        return redirect()->route('news.edit', $news)->with('success', __('News successfully added.'));
    }

    public function edit(News $news)
    {
        $news->load('images');

        return Inertia::render('Club/News/Edit', [
            'news' => [
                'id' => $news->id,
                'title' => $news->title,
                'content' => $news->content,
                'published_at' => $news->published_at,
                'end_date' => $news->end_date,
                'is_on_auth_page' => $news->is_on_auth_page,
                'is_on_public_page' => $news->is_on_public_page,
                'is_active' => $news->is_active,
                'images' => $news->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->url,
                        'is_primary' => $image->is_primary,
                        'display_order' => $image->display_order,
                    ];
                }),
            ],
        ]);
    }

    public function update(Request $request, News $news)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'published_at' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:published_at',
            'is_on_auth_page' => 'boolean',
            'is_on_public_page' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if (empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $news->update($validated);

        return redirect()->back()->with('success', __('News successfully updated.'));
    }

    public function destroy(News $news)
    {
        $news->delete();

        return redirect()->route('news.index')->with('success', __('News successfully deleted.'));
    }

    public function uploadImages(Request $request, News $news)
    {
        $request->validate([
            'images' => 'required|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $uploadedCount = 0;

        foreach ($request->file('images') as $image) {
            $path = $image->store('news/' . $news->id, 'public');

            $news->images()->create([
                'path' => $path,
                'display_order' => $news->images()->max('display_order') + 1,
                'is_primary' => $news->images()->count() === 0,
            ]);

            $uploadedCount++;
        }

        return redirect()->back()->with('success', __('Images uploaded successfully.') . ' (' . $uploadedCount . ')');
    }

    public function deleteImage(NewsImage $image)
    {
        $wasPrimary = $image->is_primary;
        $newsId = $image->news_id;

        $image->delete();

        if ($wasPrimary) {
            $firstImage = NewsImage::where('news_id', $newsId)->orderBy('display_order')->first();
            if ($firstImage) {
                $firstImage->update(['is_primary' => true]);
            }
        }

        return redirect()->back()->with('success', __('Image deleted successfully.'));
    }

    public function setPrimaryImage(News $news, NewsImage $image)
    {
        if ($image->news_id !== $news->id) {
            return redirect()->back()->withErrors(['error' => 'Invalid image for this news.']);
        }

        $news->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return redirect()->back()->with('success', __('Primary image set successfully.'));
    }

    public function reorderImages(Request $request, News $news)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:news_images,id',
        ]);

        foreach ($request->ids as $index => $id) {
            NewsImage::where('id', $id)
                ->where('news_id', $news->id)
                ->update(['display_order' => $index]);
        }

        return redirect()->back()->with('success', __('Image order updated successfully.'));
    }
}
