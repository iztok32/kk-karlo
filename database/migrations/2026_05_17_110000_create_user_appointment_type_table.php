<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_appointment_type', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('appointment_type_id')->constrained('appointment_types')->cascadeOnDelete();
            $table->primary(['user_id', 'appointment_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_appointment_type');
    }
};
