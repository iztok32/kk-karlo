<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ImportReservations extends Command
{
    protected $signature = 'reservations:import
                            {file=reservations.json : Pot do JSON datoteke}
                            {--from=2026-03-01 : Uvozi rezervacije od tega datuma naprej}
                            {--dry-run : Samo preštej, ne uvozi}';

    protected $description = 'Uvozi rezervacije iz stare aplikacije (reservations.json)';

    // Preslikava starih termin ID-jev v nove appointment ID-je
    // Ujemanje po: start_time + valid_from + valid_to + dan v tednu
    const TERMIN_MAP = [
        // 2026-03-01 → 2026-04-30 (nedelja)
        367 => 91,  // 1. ura Maruša (nadaljevalci) 09-10
        368 => 92,  // 2. ura Maruša - mešana skupina 10-11
        369 => 93,  // 3. ura Maruša - mešana skupina 11-12
        // 2026-03-01 → 2026-04-30 (sreda+sobota)
        370 => 94,  // 1. ura IČO 17-18
        371 => 95,  // 2. ura IČO 18-19
        // 2026-03-02 → 2026-04-30 (torek)
        372 => 96,  // 1. ura Maruša - NADALJEVALCI 17-18
        373 => 97,  // 2. ura Maruša - NADALJEVALCI 18-19
        374 => 98,  // 3. ura Maruša - NADALJEVALCI 19-20
        // 2026-03-02 → 2026-04-30 (četrtek)
        375 => 99,  // 1. ura Maruša - NADALJEVALCI 16-17
        // 2026-03-02 → 2026-04-30 (četrtek+petek)
        376 => 100, // 2. ura MARUŠA (mešana skupina) 17-18
        377 => 101, // 3. ura Maruša - mešana skupina 18-19
        // 2026-05-01 → 2026-06-30 (nedelja)
        378 => 102, // 1. ura Maruša - NADALJEVALCI 09-10
        379 => 103, // 2. ura MARUŠA (mešana skupina) 10-11
        380 => 104, // 3. ura Maruša - mešana skupina 11-12
        // 2026-05-01 → 2026-06-30 (torek)
        381 => 105, // 1. ura Maruša - NADALJEVALCI 17-18
        382 => 106, // 2. ura Maruša - NADALJEVALCI 18-19
        383 => 107, // 3. ura Maruša - NADALJEVALCI 19-20
        // 2026-05-01 → 2026-05-31 (sreda+sobota)
        384 => 108, // 1. ura IČO 17-18
        385 => 109, // 2. ura IČO 18-19
        // 2026-06-01 → 2026-06-30 (sreda+sobota)
        386 => 110, // 1. ura IČO 18-19
        387 => 111, // 2. ura IČO 19-20
        // 2026-05-01 → 2026-05-31 (četrtek+petek)
        388 => 112, // 1. ura MARUŠA 17-18
        390 => 114, // 2. ura MARUŠA 18-19
        // 2026-06-01 → 2026-06-30 (četrtek+petek)
        389 => 113, // 1. ura MARUŠA 18-19
        391 => 115, // 2. ura MARUŠA 19-20
        // 2026-05-01 → 2026-05-31 (četrtek)
        392 => 116, // 1. ura Maruša - NADALJEVALCI 16-17
        // 2026-06-01 → 2026-06-30 (četrtek)
        393 => 117, // 1. ura Maruša - NADALJEVALCI 17-18
    ];

    public function handle(): int
    {
        $filePath = $this->argument('file');
        $fromDate = $this->option('from');
        $dryRun   = $this->option('dry-run');

        if (! file_exists($filePath)) {
            $this->error("Datoteka ne obstaja: {$filePath}");
            return self::FAILURE;
        }

        $this->info("Berem {$filePath} ...");
        $raw  = json_decode(file_get_contents($filePath), true);
        $tableObj = collect($raw)->firstWhere('type', 'table');
        $allRows  = $tableObj ? $tableObj['data'] : $raw;

        $this->info('Skupaj zapisov v JSON: ' . count($allRows));

        // Preslikava old_id → new user ID
        $userMap = DB::table('users')
            ->whereNotNull('old_id')
            ->pluck('id', 'old_id')
            ->toArray();

        // Veljavni horse ID-ji v novi bazi
        $validHorseIds = DB::table('horses')
            ->whereNull('deleted_at')
            ->pluck('id')
            ->flip()
            ->toArray();

        $mappedTerminIds = array_keys(self::TERMIN_MAP);

        // Filtriraj ustrezne rezervacije
        $rows = collect($allRows)->filter(function ($r) use ($mappedTerminIds, $fromDate) {
            $terminId = (int) $r['reservations_termin_id'];
            $date     = substr($r['reservations_date'], 0, 10);
            return in_array($terminId, $mappedTerminIds)
                && $date >= $fromDate;
        });

        $this->info("Rezervacije za uvoz (po filtru): {$rows->count()}");

        $imported = 0;
        $skipped  = 0;
        $noUser   = 0;
        $noHorse  = 0;

        foreach ($rows as $r) {
            $oldTerminId = (int) $r['reservations_termin_id'];
            $oldUserId   = (int) $r['reservations_user_id'];
            $oldHorseId  = (int) $r['reservations_horse_id'];
            $date        = substr($r['reservations_date'], 0, 10);

            $newAppointmentId = self::TERMIN_MAP[$oldTerminId];

            // Preslikava userja
            if (! isset($userMap[$oldUserId])) {
                $noUser++;
                continue;
            }
            $newUserId = $userMap[$oldUserId];

            // Preskočimo brez konja
            if ($oldHorseId === 0 || ! isset($validHorseIds[$oldHorseId])) {
                $noHorse++;
                continue;
            }

            if ($dryRun) {
                $imported++;
                continue;
            }

            // Vstavi ali preskoči duplikate
            $inserted = DB::table('reservations')->insertOrIgnore([[
                'appointment_id'   => $newAppointmentId,
                'horse_id'         => $oldHorseId,
                'user_id'          => $newUserId,
                'reservation_date' => $date,
                'notes'            => null,
                'created_at'       => $r['reservations_date_created'] ?? now(),
                'updated_at'       => $r['reservations_date_modified'] ?? now(),
            ]]);

            if ($inserted) {
                $imported++;
            } else {
                $skipped++;
            }
        }

        $mode = $dryRun ? '[DRY RUN] Bi uvozil' : 'Uvoženih';
        $this->info("{$mode}: {$imported}");
        $this->warn("Preskočenih (duplikati): {$skipped}");
        $this->warn("Preskočenih (user ni v novi bazi): {$noUser}");
        $this->warn("Preskočenih (brez konja / konj ne obstaja): {$noHorse}");

        return self::SUCCESS;
    }
}
