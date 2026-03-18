<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class News extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'content',
        'published_at',
        'end_date',
        'is_on_auth_page',
        'is_on_public_page',
        'is_active',
    ];

    protected $casts = [
        'is_on_auth_page' => 'boolean',
        'is_on_public_page' => 'boolean',
        'is_active' => 'boolean',
        'published_at' => 'datetime',
        'end_date' => 'datetime',
    ];
}
