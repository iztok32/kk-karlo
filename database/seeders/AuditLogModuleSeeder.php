<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;
use App\Models\Permission;

class AuditLogModuleSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create the audit_logs module
        $module = Module::firstOrCreate(
            ['name' => 'audit_logs'],
            [
                'web_root' => '/audit-log',
                'description' => 'View and track all system changes - who, when, and what was modified'
            ]
        );

        // Create standard permissions for audit_logs
        $permissions = [
            [
                'name' => 'View Audit Logs',
                'slug' => 'audit_logs.view',
                'module' => 'audit_logs',
                'is_active' => true,
            ],
            [
                'name' => 'View All Audit Logs',
                'slug' => 'audit_logs.is_global',
                'module' => 'audit_logs',
                'is_active' => true,
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }

        $this->command->info('Audit Logs module and permissions created successfully!');
    }
}
