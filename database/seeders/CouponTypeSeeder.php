<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CouponTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\CouponType::firstOrCreate(['name' => 'Kupon']);
        \App\Models\CouponType::firstOrCreate(['name' => 'Lonža']);
    }
}
