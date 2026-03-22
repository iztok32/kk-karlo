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
    Route::resource('navigation', \App\Http\Controllers\Core\NavigationItemController::class)->except(['create', 'edit', 'show']);
    Route::post('navigation/reorder', [\App\Http\Controllers\Core\NavigationItemController::class, 'reorder'])->name('navigation.reorder');
    Route::post('navigation/config', [\App\Http\Controllers\Core\NavigationItemController::class, 'updateConfig'])->name('navigation.updateConfig');
    Route::post('navigation/add-block', [\App\Http\Controllers\Core\NavigationItemController::class, 'addBlock'])->name('navigation.addBlock');
    Route::delete('navigation/delete-block/{type}', [\App\Http\Controllers\Core\NavigationItemController::class, 'deleteBlock'])->name('navigation.deleteBlock');

    Route::resource('roles-group', \App\Http\Controllers\Core\RolesGroupController::class)->except(['create', 'edit', 'show']);

    Route::resource('modules-list', \App\Http\Controllers\Core\ModulesListController::class)->except(['create', 'edit', 'show']);

    Route::resource('permissions', \App\Http\Controllers\Core\PermissionsController::class)->except(['create', 'edit', 'show']);
    Route::post('permissions/toggle-standard', [\App\Http\Controllers\Core\PermissionsController::class, 'toggleStandard'])->name('permissions.toggleStandard');
    Route::delete('permissions/delete-standard', [\App\Http\Controllers\Core\PermissionsController::class, 'deleteStandard'])->name('permissions.deleteStandard');

    Route::get('roles-permissions', [\App\Http\Controllers\Core\RolesPermissionsController::class, 'index'])->name('roles-permissions.index');
    Route::post('roles-permissions/toggle', [\App\Http\Controllers\Core\RolesPermissionsController::class, 'togglePermission'])->name('roles-permissions.toggle');

    Route::resource('users', \App\Http\Controllers\Core\UsersController::class)->except(['create', 'edit', 'show']);
    Route::post('users/send-password-reset', [\App\Http\Controllers\Core\UsersController::class, 'sendPasswordResetLink'])->name('users.send-password-reset');

    Route::get('audit-log', [\App\Http\Controllers\Core\AuditLogController::class, 'index'])->name('audit-log.index');
    Route::get('audit-log/{audit}', [\App\Http\Controllers\Core\AuditLogController::class, 'show'])->name('audit-log.show');

    Route::get('notifications', [\App\Http\Controllers\Core\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/portal', [\App\Http\Controllers\Core\NotificationController::class, 'sendPortalNotification'])->name('notifications.send-portal');
    Route::post('notifications/email', [\App\Http\Controllers\Core\NotificationController::class, 'sendEmail'])->name('notifications.send-email');
    Route::post('notifications/sms', [\App\Http\Controllers\Core\NotificationController::class, 'sendSms'])->name('notifications.send-sms');
    Route::post('notifications/{notification}/read', [\App\Http\Controllers\Core\NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
});

require __DIR__.'/auth.php';

Route::post('/locale', \App\Http\Controllers\LocaleController::class)->name('locale.update');
