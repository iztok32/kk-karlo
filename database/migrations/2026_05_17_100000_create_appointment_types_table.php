<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->boolean('horses_selectable')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        // Seed existing types so appointments.type FK values 1 and 2 remain valid
        DB::table('appointment_types')->insert([
            ['id' => 1, 'name' => 'Cel termin',  'is_active' => true, 'horses_selectable' => true, 'display_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Pol termina', 'is_active' => true, 'horses_selectable' => true, 'display_order' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Reset sequence so next insert gets id=3
        DB::statement("SELECT setval('appointment_types_id_seq', (SELECT MAX(id) FROM appointment_types))");
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_types');
    }
};
