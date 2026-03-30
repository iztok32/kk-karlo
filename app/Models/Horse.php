<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Horse extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'year',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'year' => 'integer',
        'display_order' => 'integer',
    ];

    /**
     * Get the images for the horse
     */
    public function images()
    {
        return $this->hasMany(HorseImage::class)->orderBy('display_order');
    }

    /**
     * Get the primary image for the horse
     */
    public function primaryImage()
    {
        return $this->hasOne(HorseImage::class)->where('is_primary', true);
    }
}
