<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Vsako leto 1. januarja ob 6:00 pridobi praznike za naslednje leto
Schedule::command('holidays:fetch', [now()->year + 1])
    ->yearlyOn(1, 1, '06:00')
    ->description('Pridobi javne praznike za naslednje leto');
