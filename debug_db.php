<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use App\Models\Module;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;

$modules = Module::all();
echo "MODULES:\n";
foreach ($modules as $m) {
    echo "- Name: {$m->name}, Web Root: {$m->web_root}\n";
}

echo "\nROLES-PERMISSIONS RELATED PERMISSIONS:\n";
$perms = Permission::where('slug', 'like', '%roles-permissions%')
    ->orWhere('module', 'RolesPermissions')
    ->get();
foreach ($perms as $p) {
    echo "- Name: {$p->name}, Slug: {$p->slug}, Module: {$p->module}\n";
}

echo "\nROLES AND THEIR PERMISSIONS:\n";
$roles = Role::with('permissions')->get();
foreach ($roles as $r) {
    echo "- Role: {$r->name} ({$r->slug})\n";
    foreach ($r->permissions as $rp) {
        if (str_contains($rp->slug, 'roles-permissions') || str_contains($rp->slug, 'roles-group') || str_contains($rp->slug, 'permissions')) {
            echo "  * Permission: {$rp->slug}\n";
        }
    }
}
