<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use \Illuminate\Database\Eloquent\SoftDeletes;

    protected $fillable = [
        'user_id',
        'coupon_type_id',
        'quantity',
        'transaction_type',
        'reservation_id',
        'stripe_payment_intent_id',
        'price_paid',
        'notes',
    ];

    protected $casts = ['price_paid' => 'float'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function couponType()
    {
        return $this->belongsTo(CouponType::class);
    }

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }
}
