<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;
use App\Models\Permission;

class NotificationModuleSeeder extends Seeder
{
    public function run(): void
    {
        // Add Notifications module
        $module = Module::firstOrCreate(
            ['name' => 'notifications'],
            [
                'web_root' => '/notifications',
                'description' => 'Notification management - send and manage portal, email, and SMS notifications'
            ]
        );

        // Create standard permissions for Notifications module
        $permissions = [
            [
                'name' => 'View Notifications',
                'slug' => 'notifications.view',
                'module' => 'notifications',
                'is_active' => true,
            ],
            [
                'name' => 'Send Portal Notifications',
                'slug' => 'notifications.send_portal',
                'module' => 'notifications',
                'is_active' => true,
            ],
            [
                'name' => 'Send Email Notifications',
                'slug' => 'notifications.send_email',
                'module' => 'notifications',
                'is_active' => true,
            ],
            [
                'name' => 'Send SMS Notifications',
                'slug' => 'notifications.send_sms',
                'module' => 'notifications',
                'is_active' => true,
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }

        echo "Notifications module and permissions added successfully.\n";
    }
}
