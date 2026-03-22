<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('navigation_configs', function (Blueprint $table) {
            $table->string('group')->nullable()->after('type');
            $table->integer('sort_order')->default(0)->after('group');
        });

        // Initialize group for existing records
        DB::table('navigation_configs')->update(['group' => DB::raw('type')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('navigation_configs', function (Blueprint $table) {
            $table->dropColumn(['group', 'sort_order']);
        });
    }
};
