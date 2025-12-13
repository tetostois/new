<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
        });

        // Valeur par défaut: 3 jours
        DB::table('app_settings')->insert([
            'key' => 'exam_window_days',
            'value' => '3',
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('app_settings');
    }
};


