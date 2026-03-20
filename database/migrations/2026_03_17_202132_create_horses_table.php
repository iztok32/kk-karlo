<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
<<<<<<<< HEAD:database/migrations/2026_03_17_202132_create_horses_table.php
        Schema::create('horses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('year')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
========
        Schema::create('navigation_configs', function (Blueprint $table) {
            $table->id();
            $table->string('type')->unique();
            $table->string('label');
            $table->boolean('is_visible')->default(true);
>>>>>>>> Laravel-react/main:database/migrations/2026_03_19_090855_create_navigation_configs_table.php
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
<<<<<<<< HEAD:database/migrations/2026_03_17_202132_create_horses_table.php
        Schema::dropIfExists('horses');
========
        Schema::dropIfExists('navigation_configs');
>>>>>>>> Laravel-react/main:database/migrations/2026_03_19_090855_create_navigation_configs_table.php
    }
};
