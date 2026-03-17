<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class HorsePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $module = 'Horses';
        
        $permissions = [
            ['name' => 'View Horses', 'slug' => 'horses.view', 'module' => $module],
            ['name' => 'Create Horses', 'slug' => 'horses.create', 'module' => $module],
            ['name' => 'Edit Horses', 'slug' => 'horses.edit', 'module' => $module],
            ['name' => 'Delete Horses', 'slug' => 'horses.delete', 'module' => $module],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(['slug' => $permission['slug']], $permission);
        }

        // Assign to Administrator role if it exists
        $adminRole = Role::where('slug', 'administrator')->first();
        if ($adminRole) {
            $allHorsePermissions = Permission::where('module', $module)->get();
            $adminRole->permissions()->syncWithoutDetaching($allHorsePermissions->pluck('id'));
        }
    }
}
