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
        Schema::create('horse_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('horse_id')->constrained('horses')->onDelete('cascade');
            $table->string('path'); // Storage path to image
            $table->integer('display_order')->default(0);
            $table->boolean('is_primary')->default(false); // First image as primary
            $table->timestamps();

            // Index for better performance
            $table->index('horse_id');
            $table->index('display_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('horse_images');
    }
};
