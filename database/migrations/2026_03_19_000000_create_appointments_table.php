<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable();
            $table->boolean('day_monday')->default(false);
            $table->boolean('day_tuesday')->default(false);
            $table->boolean('day_wednesday')->default(false);
            $table->boolean('day_thursday')->default(false);
            $table->boolean('day_friday')->default(false);
            $table->boolean('day_saturday')->default(false);
            $table->boolean('day_sunday')->default(false);
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->integer('capacity')->nullable();
            $table->integer('type')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
