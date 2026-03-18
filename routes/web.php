<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('horses/reorder', [\App\Http\Controllers\Club\HorseController::class, 'reorder'])->name('horses.reorder');
    Route::resource('horses', \App\Http\Controllers\Club\HorseController::class);
    Route::resource('news', \App\Http\Controllers\Club\NewsController::class);
    Route::post('horseman/reorder', [\App\Http\Controllers\Club\HorsemanController::class, 'reorder'])->name('horseman.reorder');
    Route::resource('horseman', \App\Http\Controllers\Club\HorsemanController::class);
    Route::post('appointment/reorder', [\App\Http\Controllers\Club\AppointmentController::class, 'reorder'])->name('appointment.reorder');
    Route::resource('appointment', \App\Http\Controllers\Club\AppointmentController::class);
});

require __DIR__.'/auth.php';

Route::post('/locale', \App\Http\Controllers\LocaleController::class)->name('locale.update');
