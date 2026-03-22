<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class RolesGroupController extends Controller
{
    public function index()
    {
        $roles = Role::orderBy('name')->get();

        return Inertia::render('Core/RolesGroup/Index', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:roles,slug',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        Role::create($validated);

        return redirect()->back()->with('success', 'Role created successfully');
    }

    public function update(Request $request, Role $rolesGroup)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:roles,slug,' . $rolesGroup->id,
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $rolesGroup->update($validated);

        return redirect()->back()->with('success', 'Role updated successfully');
    }

    public function destroy(Role $rolesGroup)
    {
        $rolesGroup->delete();

        return redirect()->back()->with('success', 'Role deleted successfully');
    }
}
