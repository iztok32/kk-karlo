<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AppointmentType extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'is_active', 'horses_selectable', 'display_order', 'coupon_type_id'];

    protected $casts = [
        'is_active'         => 'boolean',
        'horses_selectable' => 'boolean',
        'display_order'     => 'integer',
        'coupon_type_id'    => 'integer',
    ];

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'type');
    }

    public function couponType()
    {
        return $this->belongsTo(CouponType::class);
    }
}
