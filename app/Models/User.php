<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use OwenIt\Auditing\Auditable;

class User extends Authenticatable implements AuditableContract
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
        'gsm_number',
        'avatar',
        'config',
        // Profile fields
        'address',
        'postal_code',
        'city',
        'date_of_birth',
        'username',
        'home_phone',
        'work_phone',
        'fax',
        'gsm_number_public',
        'home_phone_public',
        'work_phone_public',
        'fax_public',
        'horseman_type_id',
        'is_member',
        'membership_paid',
        'notify_free_slots',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'config' => 'array',
            // Profile casts
            'date_of_birth' => 'date',
            'gsm_number_public' => 'boolean',
            'home_phone_public' => 'boolean',
            'work_phone_public' => 'boolean',
            'fax_public' => 'boolean',
            'is_member' => 'boolean',
            'membership_paid' => 'boolean',
            'notify_free_slots' => 'boolean',
        ];
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function horsemanType()
    {
        return $this->belongsTo(HorsemanType::class);
    }

    public function coupons()
    {
        return $this->hasMany(Coupon::class);
    }

    public function hasRole($role)
    {
        if (is_string($role)) {
            return $this->roles->contains('slug', $role);
        }

        return !! $role->intersect($this->roles)->count();
    }

    public function hasPermission($permission)
    {
        return $this->roles->pluck('permissions')->flatten()->contains('slug', $permission);
    }

    public function getPermissionsAttribute()
    {
        return $this->roles->flatMap->permissions->pluck('slug')->unique()->values();
    }

    /**
     * Get a config value by key
     */
    public function getConfig(string $key, $default = null)
    {
        return data_get($this->config, $key, $default);
    }

    /**
     * Set a config value by key
     */
    public function setConfig(string $key, $value): void
    {
        $config = $this->config ?? [];
        data_set($config, $key, $value);
        $this->config = $config;
        $this->save();
    }

    /**
     * Update multiple config values
     */
    public function updateConfig(array $values): void
    {
        $config = $this->config ?? [];
        foreach ($values as $key => $value) {
            data_set($config, $key, $value);
        }
        $this->config = $config;
        $this->save();
    }

    /**
     * Scope to filter users by roles visible to the current user
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param User|null $currentUser - The user whose visible roles to check
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeVisibleToUser($query, $currentUser = null)
    {
        if (!$currentUser) {
            return $query->whereRaw('1 = 0'); // Return empty result
        }

        // Get all visible role IDs for the current user
        $visibleRoleIds = collect();

        foreach ($currentUser->roles as $userRole) {
            // SuperAdmin sees all users
            if ($userRole->isSuperAdmin()) {
                return $query;
            }

            // Get visible roles for this role
            $rolesForThisRole = Role::getVisibleRolesForRole($userRole->id);
            $visibleRoleIds = $visibleRoleIds->merge($rolesForThisRole->pluck('id'));

            // Also include the user's own role so they can see users with same role
            $visibleRoleIds->push($userRole->id);
        }

        $visibleRoleIds = $visibleRoleIds->unique();

        // If no visible roles, only show users without any roles
        if ($visibleRoleIds->isEmpty()) {
            return $query->doesntHave('roles');
        }

        // Show users that have at least one role that is visible
        // AND don't have any roles that are NOT visible
        return $query->whereHas('roles', function ($q) use ($visibleRoleIds) {
            $q->whereIn('roles.id', $visibleRoleIds);
        })->whereDoesntHave('roles', function ($q) use ($visibleRoleIds) {
            $q->whereNotIn('roles.id', $visibleRoleIds);
        });
    }
}
