<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update configs
        DB::table('navigation_configs')->where('type', 'team')->update(['type' => 'header', 'group' => 'header', 'label' => 'Glava (header)']);
        DB::table('navigation_configs')->where('type', 'project')->update(['type' => 'settings', 'group' => 'settings', 'label' => 'Nastavitveni (settings)']);
        DB::table('navigation_configs')->where('type', 'main')->update(['label' => 'Glavni meni']);

        // Update items
        DB::table('navigation_items')->where('type', 'team')->update(['type' => 'header']);
        DB::table('navigation_items')->where('type', 'project')->update(['type' => 'settings']);

        // Add users config if not exists
        if (DB::table('navigation_configs')->where('type', 'users')->count() === 0) {
            DB::table('navigation_configs')->insert([
                'type' => 'users',
                'label' => 'Uporabnikov meni',
                'group' => 'users',
                'sort_order' => 10,
                'is_visible' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('navigation_configs')->where('type', 'header')->update(['type' => 'team', 'group' => 'team', 'label' => 'Team Navigation']);
        DB::table('navigation_configs')->where('type', 'settings')->update(['type' => 'project', 'group' => 'project', 'label' => 'Project Navigation']);
        DB::table('navigation_configs')->where('type', 'users')->delete();

        DB::table('navigation_items')->where('type', 'header')->update(['type' => 'team']);
        DB::table('navigation_items')->where('type', 'settings')->update(['type' => 'project']);
    }
};
