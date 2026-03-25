<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;
use App\Models\Permission;

class RolesGroupModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Add Roles Groups module
        $module = Module::firstOrCreate(
            ['name' => 'roles-groups'],
            [
                'web_root' => '/roles-group',
                'description' => 'Role group management - create, edit, delete role groups and manage visibility'
            ]
        );

        // Create standard permissions for Roles Groups module
        $permissions = [
            [
                'name' => 'View Roles Groups',
                'slug' => 'roles-groups.view',
                'module' => 'roles-groups',
                'is_active' => true,
            ],
            [
                'name' => 'Create Roles Groups',
                'slug' => 'roles-groups.create',
                'module' => 'roles-groups',
                'is_active' => true,
            ],
            [
                'name' => 'Edit Roles Groups',
                'slug' => 'roles-groups.edit',
                'module' => 'roles-groups',
                'is_active' => true,
            ],
            [
                'name' => 'Delete Roles Groups',
                'slug' => 'roles-groups.delete',
                'module' => 'roles-groups',
                'is_active' => true,
            ],
            [
                'name' => 'Manage Role Visibility',
                'slug' => 'roles-groups.manage-visibility',
                'module' => 'roles-groups',
                'is_active' => true,
            ],
            [
                'name' => 'View All Roles Groups',
                'slug' => 'roles-groups.is_global',
                'module' => 'roles-groups',
                'is_active' => true,
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }

        echo "Roles Groups module and permissions added successfully.\n";
    }
}
