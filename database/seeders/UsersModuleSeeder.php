<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;
use App\Models\Permission;

class UsersModuleSeeder extends Seeder
{
    public function run(): void
    {
        // Add Users module
        $module = Module::firstOrCreate(
            ['name' => 'users'],
            [
                'web_root' => '/users',
                'description' => 'User management - create, edit, delete users and assign roles'
            ]
        );

        // Create standard permissions for Users module
        $permissions = [
            [
                'name' => 'View Users',
                'slug' => 'users.view',
                'module' => 'users',
                'is_active' => true,
            ],
            [
                'name' => 'Create Users',
                'slug' => 'users.create',
                'module' => 'users',
                'is_active' => true,
            ],
            [
                'name' => 'Edit Users',
                'slug' => 'users.edit',
                'module' => 'users',
                'is_active' => true,
            ],
            [
                'name' => 'Delete Users',
                'slug' => 'users.delete',
                'module' => 'users',
                'is_active' => true,
            ],
            [
                'name' => 'View All Users',
                'slug' => 'users.is_global',
                'module' => 'users',
                'is_active' => true,
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }

        echo "Users module and permissions added successfully.\n";
    }
}
