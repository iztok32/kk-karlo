<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = ['country_code', 'date', 'year', 'name', 'local_name'];

    protected $casts = [
        'date' => 'date',
        'year' => 'integer',
    ];
}
