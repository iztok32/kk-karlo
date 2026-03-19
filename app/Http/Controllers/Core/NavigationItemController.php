<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\NavigationItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NavigationItemController extends Controller
{
    public function index()
    {
        $items = NavigationItem::with('children')
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Core/Navigation/Index', [
            'items' => $items,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:navigation_items,id',
            'type' => 'required|string',
            'title_key' => 'required|string',
            'url' => 'nullable|string',
            'icon' => 'nullable|string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'permission' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        NavigationItem::create($validated);

        return redirect()->back()->with('success', 'Item created successfully');
    }

    public function update(Request $request, NavigationItem $navigation)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:navigation_items,id',
            'type' => 'required|string',
            'title_key' => 'required|string',
            'url' => 'nullable|string',
            'icon' => 'nullable|string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'permission' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $navigation->update($validated);

        return redirect()->back()->with('success', 'Item updated successfully');
    }

    public function destroy(NavigationItem $navigation)
    {
        $navigation->delete();

        return redirect()->back()->with('success', 'Item deleted successfully');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:navigation_items,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->items as $item) {
            NavigationItem::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return redirect()->back()->with('success', 'Order updated successfully');
    }
}
