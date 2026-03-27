<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class HorsePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $module = 'horses';
        
        $permissions = [
            ['name' => 'View Horses', 'slug' => 'horses.view', 'module' => $module],
            ['name' => 'Create Horses', 'slug' => 'horses.create', 'module' => $module],
            ['name' => 'Edit Horses', 'slug' => 'horses.edit', 'module' => $module],
            ['name' => 'Delete Horses', 'slug' => 'horses.delete', 'module' => $module],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(['slug' => $permission['slug']], $permission);
        }

        $allHorsePermissions = Permission::where('module', $module)->get();

        $superadminRole = Role::where('slug', 'superadmin')->first();
        if ($superadminRole) {
            $superadminRole->permissions()->syncWithoutDetaching($allHorsePermissions->pluck('id'));
        }

        $adminRole = Role::where('slug', 'admin')->first();
        if ($adminRole) {
            $adminRole->permissions()->syncWithoutDetaching($allHorsePermissions->pluck('id'));
        }
    }
}
