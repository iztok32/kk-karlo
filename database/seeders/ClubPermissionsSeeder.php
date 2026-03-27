<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class ClubPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            'news' => [
                ['name' => 'View News', 'slug' => 'news.view'],
                ['name' => 'Create News', 'slug' => 'news.create'],
                ['name' => 'Edit News', 'slug' => 'news.edit'],
                ['name' => 'Delete News', 'slug' => 'news.delete'],
            ],
            'horseman' => [
                ['name' => 'View Horseman Types', 'slug' => 'horseman.view'],
                ['name' => 'Create Horseman Types', 'slug' => 'horseman.create'],
                ['name' => 'Edit Horseman Types', 'slug' => 'horseman.edit'],
                ['name' => 'Delete Horseman Types', 'slug' => 'horseman.delete'],
            ],
            'appointment' => [
                ['name' => 'View Appointments', 'slug' => 'appointments.view'],
                ['name' => 'Create Appointments', 'slug' => 'appointments.create'],
                ['name' => 'Edit Appointments', 'slug' => 'appointments.edit'],
                ['name' => 'Delete Appointments', 'slug' => 'appointments.delete'],
            ],
            'reservations' => [
                ['name' => 'View Reservations', 'slug' => 'reservations.view'],
                ['name' => 'Create Reservations', 'slug' => 'reservations.create'],
                ['name' => 'Delete Reservations', 'slug' => 'reservations.delete'],
                ['name' => 'Reserve for Others', 'slug' => 'reservations.reserve-for-others'],
            ],
        ];

        $superadminRole = Role::where('slug', 'superadmin')->first();
        $adminRole = Role::where('slug', 'admin')->first();
        $userRole = Role::where('slug', 'user')->first();

        foreach ($modules as $module => $permissions) {
            foreach ($permissions as $permData) {
                Permission::updateOrCreate(
                    ['slug' => $permData['slug']],
                    ['name' => $permData['name'], 'module' => $module, 'is_active' => true]
                );
            }

            $allModulePermissions = Permission::where('module', $module)->get();

            if ($superadminRole) {
                $superadminRole->permissions()->syncWithoutDetaching($allModulePermissions->pluck('id'));
            }

            if ($adminRole) {
                $adminRole->permissions()->syncWithoutDetaching($allModulePermissions->pluck('id'));
            }
        }

        // Regular users get basic reservation access
        if ($userRole) {
            $userPermissions = Permission::whereIn('slug', [
                'reservations.view',
                'reservations.create',
                'reservations.delete',
            ])->get();
            $userRole->permissions()->syncWithoutDetaching($userPermissions->pluck('id'));
        }

        $this->command->info('Club permissions seeded successfully!');
    }
}
