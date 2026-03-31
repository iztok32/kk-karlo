<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_horse', function (Blueprint $table) {
            $table->foreignId('appointment_id')->constrained('appointments')->onDelete('cascade');
            $table->foreignId('horse_id')->constrained('horses')->onDelete('cascade');
            $table->primary(['appointment_id', 'horse_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_horse');
    }
};
