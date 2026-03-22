<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class RolesPermissionsController extends Controller
{
    // Standard permissions that are common
    private const STANDARD_PERMISSIONS = ['view', 'create', 'edit', 'delete', 'is_global'];

    public function index(Request $request)
    {
        // Get all roles
        $roles = Role::orderBy('name')->get();

        // Get selected role (first role by default)
        $selectedRoleId = $request->get('role_id', $roles->first()?->id);
        $selectedRole = Role::find($selectedRoleId);

        // Get all modules
        $allModules = Module::orderBy('name')->get();

        // Get all permissions
        $permissions = Permission::orderBy('module')->orderBy('slug')->get();

        // Group permissions by module
        $permissionsGrouped = $permissions->groupBy('module');

        // Get role's permissions if role is selected
        $rolePermissions = $selectedRole
            ? $selectedRole->permissions()->pluck('permissions.id')->toArray()
            : [];

        // Build grouped permissions array
        $groupedPermissions = $allModules->map(function ($module) use ($permissionsGrouped, $rolePermissions) {
            $modulePermissions = $permissionsGrouped->get($module->name, collect());

            $standard = $modulePermissions->filter(function ($permission) {
                $action = Str::after($permission->slug, '.');
                return in_array($action, self::STANDARD_PERMISSIONS);
            })->values()->map(function ($permission) use ($rolePermissions) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'slug' => $permission->slug,
                    'module' => $permission->module,
                    'is_active' => $permission->is_active,
                    'is_assigned' => in_array($permission->id, $rolePermissions),
                ];
            });

            $custom = $modulePermissions->filter(function ($permission) {
                $action = Str::after($permission->slug, '.');
                return !in_array($action, self::STANDARD_PERMISSIONS);
            })->values()->map(function ($permission) use ($rolePermissions) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'slug' => $permission->slug,
                    'module' => $permission->module,
                    'is_active' => $permission->is_active,
                    'is_assigned' => in_array($permission->id, $rolePermissions),
                ];
            });

            return [
                'module' => $module->name,
                'web_root' => $module->web_root,
                'description' => $module->description,
                'standard' => $standard,
                'custom' => $custom,
                'assigned_count' => $standard->where('is_assigned', true)->count() + $custom->where('is_assigned', true)->count(),
                'total_count' => $standard->count() + $custom->count(),
            ];
        })->values();

        return Inertia::render('Core/RolesPermissions/Index', [
            'roles' => $roles,
            'selectedRole' => $selectedRole,
            'groupedPermissions' => $groupedPermissions,
            'standardPermissions' => self::STANDARD_PERMISSIONS,
        ]);
    }

    public function togglePermission(Request $request)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'permission_id' => 'required|exists:permissions,id',
        ]);

        $role = Role::findOrFail($validated['role_id']);
        $permissionId = $validated['permission_id'];

        // Check if permission is already assigned
        if ($role->permissions()->where('permission_id', $permissionId)->exists()) {
            // Detach permission
            $role->permissions()->detach($permissionId);
            return redirect()->back()->with('success', 'Permission removed from role');
        } else {
            // Attach permission
            $role->permissions()->attach($permissionId);
            return redirect()->back()->with('success', 'Permission assigned to role');
        }
    }
}
