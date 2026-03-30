<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class HorseImage extends Model
{
    protected $fillable = [
        'horse_id',
        'path',
        'display_order',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'display_order' => 'integer',
    ];

    /**
     * Get the horse that owns the image
     */
    public function horse()
    {
        return $this->belongsTo(Horse::class);
    }

    /**
     * Get the full URL for the image
     */
    public function getUrlAttribute(): string
    {
        return Storage::url($this->path);
    }

    /**
     * Delete the image file when the model is deleted
     */
    protected static function booted()
    {
        static::deleting(function ($image) {
            Storage::delete($image->path);
        });
    }
}
