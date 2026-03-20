<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NavigationConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $configs = [
            ['type' => 'main', 'label' => 'Main Navigation'],
            ['type' => 'team', 'label' => 'Team Navigation'],
            ['type' => 'project', 'label' => 'Project Navigation'],
        ];

        foreach ($configs as $config) {
            \App\Models\NavigationConfig::updateOrCreate(
                ['type' => $config['type']],
                ['label' => $config['label']]
            );
        }
    }
}
