<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class NewsImage extends Model
{
    protected $fillable = [
        'news_id',
        'path',
        'display_order',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'display_order' => 'integer',
    ];

    public function news()
    {
        return $this->belongsTo(News::class);
    }

    public function getUrlAttribute(): string
    {
        return Storage::url($this->path);
    }

    protected static function booted()
    {
        static::deleting(function ($image) {
            Storage::delete($image->path);
        });
    }
}
