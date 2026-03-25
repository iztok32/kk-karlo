<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained('appointments');
            $table->foreignId('horse_id')->constrained('horses');
            $table->foreignId('user_id')->constrained('users');
            $table->date('reservation_date');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // One reservation per user per appointment per date
            $table->unique(['user_id', 'appointment_id', 'reservation_date'], 'reservation_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
