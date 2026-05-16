<?php

namespace App\Console\Commands;

use App\Models\Holiday;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class FetchHolidays extends Command
{
    protected $signature = 'holidays:fetch
                            {year? : Leta za kateri se pridobijo prazniki (privzeto: tekoče in naslednje leto)}
                            {--country=* : Kode držav (privzeto: vse podprte)}';

    protected $description = 'Pridobi državne praznike iz Nager.Date API in jih shrani v bazo';

    // Podprte države glede na jezike aplikacije
    const LOCALE_COUNTRY = [
        'sl' => 'SI',  // Slovenija
        'hr' => 'HR',  // Hrvaška
        'it' => 'IT',  // Italija
        'de' => 'DE',  // Nemčija
        'en' => 'GB',  // Velika Britanija
    ];

    const API_BASE = 'https://date.nager.at/api/v3/PublicHolidays';

    public function handle(): int
    {
        $yearArg   = $this->argument('year');
        $years     = $yearArg ? [(int) $yearArg] : [now()->year, now()->year + 1];
        $countries = $this->option('country') ?: array_values(self::LOCALE_COUNTRY);
        $countries = array_unique($countries);

        foreach ($years as $year) {
            foreach ($countries as $country) {
                $this->fetchForCountry($country, $year);
            }
        }

        return self::SUCCESS;
    }

    private function fetchForCountry(string $country, int $year): void
    {
        $url = self::API_BASE . "/{$year}/{$country}";

        $response = Http::timeout(10)->get($url);

        if (! $response->ok()) {
            $this->error("  [{$country} {$year}] API napaka: HTTP {$response->status()}");
            return;
        }

        $holidays = $response->json();

        if (! is_array($holidays) || count($holidays) === 0) {
            $this->warn("  [{$country} {$year}] Ni podatkov.");
            return;
        }

        $count = 0;
        foreach ($holidays as $h) {
            Holiday::updateOrCreate(
                ['date' => $h['date'], 'country_code' => $country],
                [
                    'year'       => $year,
                    'name'       => $h['name'],
                    'local_name' => $h['localName'] ?? null,
                ]
            );
            $count++;
        }

        $this->info("  [{$country} {$year}] Shranjenih: {$count} praznikov.");
    }
}
