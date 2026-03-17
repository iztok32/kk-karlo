<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NavigationItem;

class HorseNavigationSeeder extends Seeder
{
    public function run(): void
    {
        // Find "Club" parent if it exists
        $clubParent = NavigationItem::where('title_key', 'Club')->first();

        NavigationItem::updateOrCreate(
            ['url' => '/club/horses'],
            [
                'parent_id' => $clubParent ? $clubParent->id : null,
                'type' => $clubParent ? 'child' : 'main',
                'title_key' => 'Konji',
                'icon' => 'Horse',
                'sort_order' => 10,
                'is_active' => true,
                'permission' => 'horses.view',
            ]
        );
    }
}
