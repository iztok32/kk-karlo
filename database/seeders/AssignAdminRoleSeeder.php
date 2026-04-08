<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AssignAdminRoleSeeder extends Seeder
{
    /**
     * Usage:
     *   php artisan db:seed --class=AssignAdminRoleSeeder
     *   php artisan db:seed --class=AssignAdminRoleSeeder -- --role=user --ids=1,2,3
     */
    public function run(): void
    {
        $roleSlug = $this->command->option('role') ?? 'admin';

        $rawIds = $this->command->option('ids');
        if ($rawIds) {
            $oldIds = array_map('intval', explode(',', $rawIds));
        } else {
            // Default: admin old_ids
            $oldIds = [1, 3, 4, 6, 69, 605, 686, 765, 796, 975, 984];
        }

        $roleId = DB::table('roles')->where('slug', $roleSlug)->value('id');

        if (!$roleId) {
            $this->command->error("Vloga \"{$roleSlug}\" ni bila najdena v tabeli roles.");
            return;
        }

        $userIds = DB::table('users')->whereIn('old_id', $oldIds)->pluck('id');

        $now = Carbon::now();
        $assigned = 0;

        foreach ($userIds as $userId) {
            $exists = DB::table('role_user')
                ->where('user_id', $userId)
                ->where('role_id', $roleId)
                ->exists();

            if (!$exists) {
                DB::table('role_user')->insert([
                    'user_id'    => $userId,
                    'role_id'    => $roleId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $assigned++;
            }
        }

        $notFound = count($oldIds) - $userIds->count();

        $this->command->info("Vloga \"{$roleSlug}\" dodeljena: {$assigned} uporabnikom.");
        if ($notFound > 0) {
            $this->command->warn("{$notFound} old_id vrednosti ni bilo najdenih (niso bili uvoženi).");
        }
    }
}
