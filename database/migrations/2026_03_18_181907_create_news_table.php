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
        Schema::create('news', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->string('title');
            $blueprint->text('content');
            $blueprint->timestamp('published_at')->nullable();
            $blueprint->timestamp('end_date')->nullable();
            $blueprint->boolean('is_on_auth_page')->default(false);
            $blueprint->boolean('is_on_public_page')->default(false);
            $blueprint->boolean('is_active')->default(true);
            $blueprint->softDeletes();
            $blueprint->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};
