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
            if (!Schema::hasColumn('users', 'selected_certification')) {
                $table->string('selected_certification')->nullable()->after('profession');
            }
            if (!Schema::hasColumn('users', 'has_paid')) {
                $table->boolean('has_paid')->default(false)->after('selected_certification');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'has_paid')) {
                $table->dropColumn('has_paid');
            }
            if (Schema::hasColumn('users', 'selected_certification')) {
                $table->dropColumn('selected_certification');
            }
        });
    }
};


