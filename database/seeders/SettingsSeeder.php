<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key'   => 'reservation.min_days_in_advance',
                'value' => '0',
                'type'  => 'integer',
                'group' => 'reservations',
            ],
            [
                'key'   => 'reservation.max_days_in_advance',
                'value' => '14',
                'type'  => 'integer',
                'group' => 'reservations',
            ],
            [
                'key'   => 'reservation.cancellation_days',
                'value' => '2',
                'type'  => 'integer',
                'group' => 'reservations',
            ],
            [
                'key'   => 'general.default_admin_ids',
                'value' => '[]',
                'type'  => 'string',
                'group' => 'general',
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->updateOrInsert(
                ['key' => $setting['key']],
                [...$setting, 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
