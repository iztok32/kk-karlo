<?php

namespace Database\Seeders;

use App\Models\NavigationItem;
use Illuminate\Database\Seeder;

class ClubNavigationSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'url'        => '/news',
                'parent_id'  => null,
                'type'       => 'main',
                'title_key'  => 'Novice',
                'icon'       => 'Newspaper',
                'sort_order' => 11,
                'is_active'  => true,
                'permission' => 'news.view',
            ],
            [
                'url'        => '/horseman',
                'parent_id'  => null,
                'type'       => 'main',
                'title_key'  => 'Jahači',
                'icon'       => 'PersonStanding',
                'sort_order' => 12,
                'is_active'  => true,
                'permission' => 'horseman.view',
            ],
            [
                'url'        => '/appointment',
                'parent_id'  => null,
                'type'       => 'main',
                'title_key'  => 'Termini',
                'icon'       => 'Calendar',
                'sort_order' => 13,
                'is_active'  => true,
                'permission' => 'appointments.view',
            ],
            [
                'url'        => '/reservations',
                'parent_id'  => null,
                'type'       => 'main',
                'title_key'  => 'Rezervacije',
                'icon'       => 'CalendarCheck',
                'sort_order' => 14,
                'is_active'  => true,
                'permission' => 'reservations.view',
            ],
        ];

        foreach ($items as $item) {
            NavigationItem::updateOrCreate(['url' => $item['url']], $item);
        }

        $this->command->info('Club navigation items seeded successfully!');
    }
}
