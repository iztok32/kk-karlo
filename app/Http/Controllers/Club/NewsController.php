<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class NewsController extends Controller
{
    public function index()
    {
        return Inertia::render('Club/News/Index', [
            'news' => News::orderBy('published_at', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        Log::info('News store request:', $request->all());

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'published_at' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:published_at',
            'is_on_auth_page' => 'boolean',
            'is_on_public_page' => 'boolean',
            'is_active' => 'boolean',
        ]);

        // Default published_at to now if not provided
        if (empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        News::create($validated);

        return redirect()->back()->with('success', __('News successfully added.'));
    }

    public function update(Request $request, News $news)
    {
        Log::info('News update request:', $request->all());

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

        return redirect()->back()->with('success', __('News successfully deleted.'));
    }
}
