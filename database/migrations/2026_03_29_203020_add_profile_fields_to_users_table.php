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
        Schema::table('users', function (Blueprint $table) {
            // Splošni podatki
            $table->string('address')->nullable()->after('email');
            $table->string('postal_code', 4)->nullable()->after('address');
            $table->string('city')->nullable()->after('postal_code');
            $table->date('date_of_birth')->nullable()->after('city');

            // Osebni podatki
            $table->string('username')->unique()->nullable()->after('email');

            // Telefonske številke
            $table->string('home_phone')->nullable()->after('gsm_number');
            $table->string('work_phone')->nullable()->after('home_phone');
            $table->string('fax')->nullable()->after('work_phone');

            // Visibility switches za telefonske številke
            $table->boolean('gsm_number_public')->default(false)->after('gsm_number');
            $table->boolean('home_phone_public')->default(false)->after('home_phone');
            $table->boolean('work_phone_public')->default(false)->after('work_phone');
            $table->boolean('fax_public')->default(false)->after('fax');

            // Foreign key za horseman_type
            $table->foreignId('horseman_type_id')
                ->nullable()
                ->after('fax_public')
                ->constrained('horseman_type')
                ->nullOnDelete();

            // Članske informacije
            $table->boolean('is_member')->default(false)->after('horseman_type_id');
            $table->boolean('membership_paid')->default(false)->after('is_member');
            $table->boolean('notify_free_slots')->default(true)->after('membership_paid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop columns in reverse order
            $table->dropColumn([
                'notify_free_slots',
                'membership_paid',
                'is_member',
            ]);

            $table->dropForeign(['horseman_type_id']);
            $table->dropColumn('horseman_type_id');

            $table->dropColumn([
                'fax_public',
                'work_phone_public',
                'home_phone_public',
                'gsm_number_public',
                'fax',
                'work_phone',
                'home_phone',
                'username',
                'date_of_birth',
                'city',
                'postal_code',
                'address',
            ]);
        });
    }
};
