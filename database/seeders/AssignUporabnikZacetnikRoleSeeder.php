<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AssignUporabnikZacetnikRoleSeeder extends Seeder
{
    public function run(): void
    {
        $oldIds = [
            537, 536, 548, 559, 590, 592, 597, 610, 611, 613,
            617, 619, 621, 626, 627, 633, 640, 642, 643, 646,
        ];

        $roleId = DB::table('roles')->where('slug', 'uporabnik-zacetnik')->value('id');

        if (!$roleId) {
            $this->command->error('Vloga "uporabnik-zacetnik" ni bila najdena v tabeli roles.');
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

        $this->command->info("Vloga \"uporabnik-zacetnik\" dodeljena: {$assigned} uporabnikom.");
        if ($notFound > 0) {
            $this->command->warn("{$notFound} old_id vrednosti ni bilo najdenih (niso bili uvoženi).");
        }
    }
}
