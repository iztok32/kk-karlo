<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CouponType extends Model
{
    protected $fillable = ['name', 'price'];

    protected $casts = ['price' => 'float'];

    public function coupons()
    {
        return $this->hasMany(Coupon::class);
    }
}
