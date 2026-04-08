<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ImportUsersFromOldTableSeeder extends Seeder
{
    public function run(): void
    {
        $oldUsers = DB::table('users_old')
            ->where('users_active', 1)
            ->where('users_deleted', 0)
            ->get();

        $usedUsernames = DB::table('users')->pluck('username')->filter()->flip()->toArray();
        $usedEmails    = DB::table('users')->pluck('email')->filter()->flip()->toArray();

        $imported = 0;
        $skipped  = 0;

        foreach ($oldUsers as $old) {
            // Skip if already imported (idempotent re-run)
            if (DB::table('users')->where('old_id', $old->users_id)->exists()) {
                $skipped++;
                continue;
            }

            // ── name ──────────────────────────────────────────────────────────
            $name = trim(($old->users_name ?? '') . ' ' . ($old->users_surname ?? ''));
            if ($name === '') {
                $name = $old->users_username ?? "Uporabnik {$old->users_id}";
            }

            // ── email ─────────────────────────────────────────────────────────
            $rawEmail = trim($old->users_email ?? '');
            if ($rawEmail === '' || $rawEmail === '-' || $rawEmail === '/' || !str_contains($rawEmail, '@')) {
                $email = "noemail_{$old->users_id}@kkkarlo.si";
            } else {
                $email = strtolower($rawEmail);
            }
            // Deduplicate email
            if (isset($usedEmails[$email])) {
                $email = "dup_{$old->users_id}_{$email}";
            }
            $usedEmails[$email] = true;

            // ── username ──────────────────────────────────────────────────────
            $username = trim($old->users_username ?? '');
            if ($username !== '') {
                $base = $username;
                $candidate = $base;
                $suffix = 2;
                while (isset($usedUsernames[$candidate])) {
                    $candidate = $base . '_' . $suffix++;
                }
                $username = $candidate;
                $usedUsernames[$username] = true;
            } else {
                $username = null;
            }

            // ── date of birth ─────────────────────────────────────────────────
            $dateOfBirth = null;
            $raw = trim($old->users_birthday ?? '');
            if ($raw !== '') {
                if (preg_match('/^(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4})$/', $raw, $m)) {
                    // d.m.yyyy or d-m-yyyy
                    try {
                        $dateOfBirth = Carbon::createFromDate((int)$m[3], (int)$m[2], (int)$m[1])->toDateString();
                    } catch (\Exception) {
                        $dateOfBirth = null;
                    }
                }
                // only year — skip
            }

            // ── horseman_type_id ──────────────────────────────────────────────
            $horsemanTypeId = ($old->users_horseman_type > 0) ? $old->users_horseman_type : null;

            DB::table('users')->insert([
                'old_id'               => $old->users_id,
                'name'                 => $name,
                'email'                => $email,
                'username'             => $username,
                'password'             => '!', // invalid hash — must reset password
                'address'              => $old->users_address ?: null,
                'postal_code'          => $old->users_postnum ? substr($old->users_postnum, 0, 4) : null,
                'city'                 => $old->users_postname ?: null,
                'gsm_number'           => $old->users_phonenum_gsm ?: null,
                'home_phone'           => $old->users_phonenum_home ?: null,
                'work_phone'           => $old->users_phonenum_work ?: null,
                'fax'                  => $old->users_phonenum_fax ?: null,
                'date_of_birth'        => $dateOfBirth,
                'horseman_type_id'     => $horsemanTypeId,
                'is_member'            => (bool)($old->users_membership ?? 0),
                'membership_paid'      => (bool)($old->users_membership_fee ?? 0),
                'notify_free_slots'    => (bool)($old->users_reservations_notifying ?? 1),
                'is_active'            => true,
                'gsm_number_public'    => false,
                'home_phone_public'    => false,
                'work_phone_public'    => false,
                'fax_public'           => false,
                'email_verified_at'    => null,
                'created_at'           => $old->users_date_created,
                'updated_at'           => $old->users_date_modified,
            ]);

            $imported++;
        }

        $this->command->info("Uvoženih: {$imported}, preskočenih (že obstajajo): {$skipped}");
    }
}
