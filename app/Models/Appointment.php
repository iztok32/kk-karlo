<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'valid_from',
        'valid_to',
        'day_monday',
        'day_tuesday',
        'day_wednesday',
        'day_thursday',
        'day_friday',
        'day_saturday',
        'day_sunday',
        'start_time',
        'end_time',
        'capacity',
        'type',
        'display_order',
        'is_active',
    ];

    public function horses()
    {
        return $this->belongsToMany(Horse::class, 'appointment_horse');
    }

    public function teachers()
    {
        return $this->belongsToMany(User::class, 'appointment_teacher');
    }

    protected $casts = [
        'valid_from' => 'date:Y-m-d',
        'valid_to' => 'date:Y-m-d',
        'day_monday' => 'boolean',
        'day_tuesday' => 'boolean',
        'day_wednesday' => 'boolean',
        'day_thursday' => 'boolean',
        'day_friday' => 'boolean',
        'day_saturday' => 'boolean',
        'day_sunday' => 'boolean',
        'capacity' => 'integer',
        'type' => 'integer',
        'display_order' => 'integer',
        'is_active' => 'boolean',
    ];
}
