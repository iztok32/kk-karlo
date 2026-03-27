<?php
use Illuminate\Contracts\Console\Kernel;
use App\Models\Module;
use App\Models\NavigationItem;
use App\Models\User;
use App\Models\Role;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

echo "USER: test@example.com\n";
$user = User::where('email', 'test@example.com')->first();
if ($user) {
    echo "Roles: " . $user->roles->pluck('slug')->implode(', ') . "\n";
    echo "Permissions count: " . count($user->permissions) . "\n";
} else {
    echo "User not found\n";
}

echo "\nNAVIGATION ITEM for /roles-permissions:\n";
$item = NavigationItem::where('url', '/roles-permissions')->first();
if ($item) {
    echo "ID: {$item->id}\n";
    echo "Permission: " . ($item->permission ?? 'null') . "\n";
    echo "Allowed Roles: " . json_encode($item->allowed_roles) . "\n";
} else {
    echo "Navigation item not found\n";
}

echo "\nMODULE roles-permissions:\n";
$module = Module::where('name', 'roles-permissions')->first();
if ($module) {
    echo "ID: {$module->id}\n";
    echo "Name: {$module->name}\n";
    echo "Web Root: {$module->web_root}\n";
} else {
    echo "Module not found\n";
}

echo "\nPERMISSION roles-permissions.view:\n";
$perm = \App\Models\Permission::where('slug', 'roles-permissions.view')->first();
if ($perm) {
    echo "ID: {$perm->id}\n";
    echo "Module: {$perm->module}\n";
    echo "Active: " . ($perm->is_active ? 'Yes' : 'No') . "\n";
} else {
    echo "Permission not found\n";
}
