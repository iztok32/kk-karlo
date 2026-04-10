<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->string('stripe_payment_intent_id')->nullable()->unique()->after('reservation_id');
            $table->decimal('price_paid', 8, 2)->nullable()->after('stripe_payment_intent_id');
            $table->text('notes')->nullable()->after('price_paid');
        });
    }

    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn(['stripe_payment_intent_id', 'price_paid', 'notes']);
        });
    }
};
