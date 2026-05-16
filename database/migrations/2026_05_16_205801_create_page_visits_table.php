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
        Schema::create('page_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('url', 500);
            $table->string('route_name', 100)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('session_id', 100)->nullable();
            $table->timestamp('visited_at')->useCurrent();

            $table->index('user_id');
            $table->index('route_name');
            $table->index('session_id');
            $table->index('visited_at');
            $table->index(['visited_at', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_visits');
    }
};
