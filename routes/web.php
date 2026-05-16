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
        'activeMembers' => \App\Models\User::where('is_active', true)->count(),
        'activeHorses' => \App\Models\Horse::where('is_active', true)->count(),
    ]);
});

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
    Route::delete('/profile/avatar', [ProfileController::class, 'destroyAvatar'])->name('profile.avatar.destroy');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    // Horses routes with permission middleware
    Route::middleware('permission:horses.view')->group(function () {
        Route::get('horses', [\App\Http\Controllers\Club\HorseController::class, 'index'])->name('horses.index');
    });
    Route::middleware('permission:horses.create')->group(function () {
        Route::post('horses', [\App\Http\Controllers\Club\HorseController::class, 'store'])->name('horses.store');
        Route::post('horses/{horse}/images', [\App\Http\Controllers\Club\HorseController::class, 'uploadImages'])->name('horses.images.upload');
    });
    Route::middleware('permission:horses.edit')->group(function () {
        Route::put('horses/{horse}', [\App\Http\Controllers\Club\HorseController::class, 'update'])->name('horses.update');
        Route::patch('horses/{horse}', [\App\Http\Controllers\Club\HorseController::class, 'update']);
        Route::post('horses/reorder', [\App\Http\Controllers\Club\HorseController::class, 'reorder'])->name('horses.reorder');
        Route::delete('horse-images/{image}', [\App\Http\Controllers\Club\HorseController::class, 'deleteImage'])->name('horses.images.delete');
        Route::post('horses/{horse}/images/{image}/primary', [\App\Http\Controllers\Club\HorseController::class, 'setPrimaryImage'])->name('horses.images.primary');
        Route::post('horses/{horse}/images/reorder', [\App\Http\Controllers\Club\HorseController::class, 'reorderImages'])->name('horses.images.reorder');
    });
    Route::middleware('permission:horses.delete')->group(function () {
        Route::delete('horses/{horse}', [\App\Http\Controllers\Club\HorseController::class, 'destroy'])->name('horses.destroy');
    });

    // News routes with permission middleware
    Route::middleware('permission:news.view')->group(function () {
        Route::get('news', [\App\Http\Controllers\Club\NewsController::class, 'index'])->name('news.index');
    });
    Route::middleware('permission:news.create')->group(function () {
        Route::get('news/create', [\App\Http\Controllers\Club\NewsController::class, 'create'])->name('news.create');
        Route::post('news', [\App\Http\Controllers\Club\NewsController::class, 'store'])->name('news.store');
    });
    Route::middleware('permission:news.edit')->group(function () {
        Route::get('news/{news}/edit', [\App\Http\Controllers\Club\NewsController::class, 'edit'])->name('news.edit');
        Route::put('news/{news}', [\App\Http\Controllers\Club\NewsController::class, 'update'])->name('news.update');
        Route::patch('news/{news}', [\App\Http\Controllers\Club\NewsController::class, 'update']);
        Route::post('news/{news}/images', [\App\Http\Controllers\Club\NewsController::class, 'uploadImages'])->name('news.images.upload');
        Route::delete('news-images/{image}', [\App\Http\Controllers\Club\NewsController::class, 'deleteImage'])->name('news.images.delete');
        Route::post('news/{news}/images/reorder', [\App\Http\Controllers\Club\NewsController::class, 'reorderImages'])->name('news.images.reorder');
        Route::post('news/{news}/images/{image}/primary', [\App\Http\Controllers\Club\NewsController::class, 'setPrimaryImage'])->name('news.images.primary');
    });
    Route::middleware('permission:news.delete')->group(function () {
        Route::delete('news/{news}', [\App\Http\Controllers\Club\NewsController::class, 'destroy'])->name('news.destroy');
    });

    // Horseman routes with permission middleware
    Route::middleware('permission:horseman.view')->group(function () {
        Route::get('horseman', [\App\Http\Controllers\Club\HorsemanController::class, 'index'])->name('horseman.index');
    });
    Route::middleware('permission:horseman.create')->group(function () {
        Route::post('horseman', [\App\Http\Controllers\Club\HorsemanController::class, 'store'])->name('horseman.store');
    });
    Route::middleware('permission:horseman.edit')->group(function () {
        Route::put('horseman/{horseman}', [\App\Http\Controllers\Club\HorsemanController::class, 'update'])->name('horseman.update');
        Route::patch('horseman/{horseman}', [\App\Http\Controllers\Club\HorsemanController::class, 'update']);
        Route::post('horseman/reorder', [\App\Http\Controllers\Club\HorsemanController::class, 'reorder'])->name('horseman.reorder');
    });
    Route::middleware('permission:horseman.delete')->group(function () {
        Route::delete('horseman/{horseman}', [\App\Http\Controllers\Club\HorsemanController::class, 'destroy'])->name('horseman.destroy');
    });

    // Appointment routes with permission middleware
    Route::middleware('permission:appointments.view')->group(function () {
        Route::get('appointment', [\App\Http\Controllers\Club\AppointmentController::class, 'index'])->name('appointment.index');
    });
    Route::middleware('permission:appointments.create')->group(function () {
        Route::post('appointment', [\App\Http\Controllers\Club\AppointmentController::class, 'store'])->name('appointment.store');
    });
    Route::middleware('permission:appointments.edit')->group(function () {
        Route::put('appointment/{appointment}', [\App\Http\Controllers\Club\AppointmentController::class, 'update'])->name('appointment.update');
        Route::patch('appointment/{appointment}', [\App\Http\Controllers\Club\AppointmentController::class, 'update']);
        Route::post('appointment/reorder', [\App\Http\Controllers\Club\AppointmentController::class, 'reorder'])->name('appointment.reorder');
    });
    Route::middleware('permission:appointments.delete')->group(function () {
        Route::delete('appointment/{appointment}', [\App\Http\Controllers\Club\AppointmentController::class, 'destroy'])->name('appointment.destroy');
    });
    Route::resource('reservations', \App\Http\Controllers\Club\ReservationController::class)->only(['index', 'store', 'destroy']);
    Route::post('reservations/{reservation}/notify-late-cancellation', [\App\Http\Controllers\Club\ReservationController::class, 'notifyLateCancellation'])->name('reservations.notify-late-cancellation');
    Route::resource('coupons', \App\Http\Controllers\Club\CouponController::class)->only(['index', 'store', 'destroy']);
    Route::middleware('permission:statistics.view')->group(function () {
        Route::get('statistics', [\App\Http\Controllers\Club\StatisticsController::class, 'index'])->name('statistics.index');
    });
    Route::get('purchase', [\App\Http\Controllers\Club\PurchaseController::class, 'index'])->name('purchase.index');
    Route::post('purchase/intent', [\App\Http\Controllers\Club\PurchaseController::class, 'createIntent'])->name('purchase.intent');
    Route::post('purchase/confirm', [\App\Http\Controllers\Club\PurchaseController::class, 'confirm'])->name('purchase.confirm');
    Route::resource('navigation', \App\Http\Controllers\Core\NavigationItemController::class)->except(['create', 'edit', 'show']);
    Route::post('navigation/reorder', [\App\Http\Controllers\Core\NavigationItemController::class, 'reorder'])->name('navigation.reorder');
    Route::post('navigation/config', [\App\Http\Controllers\Core\NavigationItemController::class, 'updateConfig'])->name('navigation.updateConfig');
    Route::post('navigation/add-block', [\App\Http\Controllers\Core\NavigationItemController::class, 'addBlock'])->name('navigation.addBlock');
    Route::delete('navigation/delete-block/{type}', [\App\Http\Controllers\Core\NavigationItemController::class, 'deleteBlock'])->name('navigation.deleteBlock');

    // RolesGroup routes with permission middleware
    Route::middleware('permission:roles-group.view')->group(function () {
        Route::get('roles-group', [\App\Http\Controllers\Core\RolesGroupController::class, 'index'])->name('roles-group.index');
        Route::get('roles-group/{role}/available-roles', [\App\Http\Controllers\Core\RolesGroupController::class, 'getAvailableRoles'])->name('roles-group.available-roles');
    });
    Route::middleware('permission:roles-group.create')->group(function () {
        Route::post('roles-group', [\App\Http\Controllers\Core\RolesGroupController::class, 'store'])->name('roles-group.store');
    });
    Route::middleware('permission:roles-group.edit')->group(function () {
        Route::put('roles-group/{roles_group}', [\App\Http\Controllers\Core\RolesGroupController::class, 'update'])->name('roles-group.update');
        Route::patch('roles-group/{roles_group}', [\App\Http\Controllers\Core\RolesGroupController::class, 'update']);
        Route::post('roles-group/grant-visibility', [\App\Http\Controllers\Core\RolesGroupController::class, 'grantVisibility'])->name('roles-group.grant-visibility');
        Route::post('roles-group/revoke-visibility', [\App\Http\Controllers\Core\RolesGroupController::class, 'revokeVisibility'])->name('roles-group.revoke-visibility');
        Route::post('roles-group/reorder', [\App\Http\Controllers\Core\RolesGroupController::class, 'reorder'])->name('roles-group.reorder');
    });
    Route::middleware('permission:roles-group.delete')->group(function () {
        Route::delete('roles-group/{roles_group}', [\App\Http\Controllers\Core\RolesGroupController::class, 'destroy'])->name('roles-group.destroy');
    });

    Route::resource('modules-list', \App\Http\Controllers\Core\ModulesListController::class)->except(['create', 'edit', 'show']);

    Route::resource('permissions', \App\Http\Controllers\Core\PermissionsController::class)->except(['create', 'edit', 'show']);
    Route::post('permissions/toggle-standard', [\App\Http\Controllers\Core\PermissionsController::class, 'toggleStandard'])->name('permissions.toggleStandard');
    Route::delete('permissions/delete-standard', [\App\Http\Controllers\Core\PermissionsController::class, 'deleteStandard'])->name('permissions.deleteStandard');

    Route::get('roles-permissions', [\App\Http\Controllers\Core\RolesPermissionsController::class, 'index'])->name('roles-permissions.index');
    Route::post('roles-permissions/toggle', [\App\Http\Controllers\Core\RolesPermissionsController::class, 'togglePermission'])->name('roles-permissions.toggle');
    Route::post('roles-permissions/toggle-navigation', [\App\Http\Controllers\Core\RolesPermissionsController::class, 'toggleNavigationVisibility'])->name('roles-permissions.toggle-navigation');

    // Users routes with permission middleware
    Route::middleware('permission:users.view')->group(function () {
        Route::get('users', [\App\Http\Controllers\Core\UsersController::class, 'index'])->name('users.index');
    });
    Route::middleware('permission:users.create')->group(function () {
        Route::post('users', [\App\Http\Controllers\Core\UsersController::class, 'store'])->name('users.store');
    });
    Route::middleware('permission:users.edit')->group(function () {
        Route::put('users/{user}', [\App\Http\Controllers\Core\UsersController::class, 'update'])->name('users.update');
        Route::patch('users/{user}', [\App\Http\Controllers\Core\UsersController::class, 'update']);
        Route::post('users/send-password-reset', [\App\Http\Controllers\Core\UsersController::class, 'sendPasswordResetLink'])->name('users.send-password-reset');
    });
    Route::middleware('permission:users.delete')->group(function () {
        Route::delete('users/{user}', [\App\Http\Controllers\Core\UsersController::class, 'destroy'])->name('users.destroy');
    });

    Route::get('audit-log', [\App\Http\Controllers\Core\AuditLogController::class, 'index'])->name('audit-log.index');
    Route::get('audit-log/{audit}', [\App\Http\Controllers\Core\AuditLogController::class, 'show'])->name('audit-log.show');

    Route::get('notifications', [\App\Http\Controllers\Core\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/inbox', [\App\Http\Controllers\Core\NotificationController::class, 'inbox'])->name('notifications.inbox');
    Route::post('notifications/portal', [\App\Http\Controllers\Core\NotificationController::class, 'sendPortalNotification'])->name('notifications.send-portal');
    Route::post('notifications/email', [\App\Http\Controllers\Core\NotificationController::class, 'sendEmail'])->name('notifications.send-email');
    Route::post('notifications/sms', [\App\Http\Controllers\Core\NotificationController::class, 'sendSms'])->name('notifications.send-sms');
    Route::post('notifications/mark-all-read', [\App\Http\Controllers\Core\NotificationController::class, 'markAllRead'])->name('notifications.mark-all-read');
    Route::post('notifications/{notification}/read', [\App\Http\Controllers\Core\NotificationController::class, 'markAsRead'])->name('notifications.mark-read');

    // Articles routes with permission middleware
    Route::middleware('permission:articles.view')->group(function () {
        Route::get('articles', [\App\Http\Controllers\Core\ArticlesController::class, 'index'])->name('articles.index');
    });
    Route::middleware('permission:articles.create')->group(function () {
        Route::post('articles', [\App\Http\Controllers\Core\ArticlesController::class, 'store'])->name('articles.store');
    });
    Route::middleware('permission:articles.edit')->group(function () {
        Route::put('articles/{article}', [\App\Http\Controllers\Core\ArticlesController::class, 'update'])->name('articles.update');
        Route::patch('articles/{article}', [\App\Http\Controllers\Core\ArticlesController::class, 'update']);
        Route::post('articles/{article}/media', [\App\Http\Controllers\Core\ArticlesController::class, 'uploadMedia'])->name('articles.media.upload');
        Route::delete('articles/{article}/media/{mediaId}', [\App\Http\Controllers\Core\ArticlesController::class, 'deleteMedia'])->name('articles.media.delete');
    });
    Route::middleware('permission:articles.delete')->group(function () {
        Route::delete('articles/{article}', [\App\Http\Controllers\Core\ArticlesController::class, 'destroy'])->name('articles.destroy');
    });

    Route::get('admin/settings', [\App\Http\Controllers\Admin\SettingController::class, 'index'])->name('admin.settings.index');
    Route::post('admin/settings', [\App\Http\Controllers\Admin\SettingController::class, 'update'])->name('admin.settings.update');

    Route::get('user/config', [\App\Http\Controllers\UserConfigController::class, 'show'])->name('user.config.show');
    Route::post('user/config', [\App\Http\Controllers\UserConfigController::class, 'update'])->name('user.config.update');
    Route::post('user/config/batch', [\App\Http\Controllers\UserConfigController::class, 'updateBatch'])->name('user.config.batch');
});

require __DIR__.'/auth.php';

// Stripe webhook — outside auth middleware; CSRF excluded in bootstrap/app.php
Route::post('/stripe/webhook', [\App\Http\Controllers\Club\PurchaseController::class, 'webhook'])
    ->name('stripe.webhook');

Route::post('/locale', \App\Http\Controllers\LocaleController::class)->name('locale.update');
