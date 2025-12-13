<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'exam_start_at')) {
                $table->timestamp('exam_start_at')->nullable()->after('exam_terms_certification_type');
            }
            if (!Schema::hasColumn('users', 'exam_expires_at')) {
                $table->timestamp('exam_expires_at')->nullable()->after('exam_start_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'exam_expires_at')) {
                $table->dropColumn('exam_expires_at');
            }
            if (Schema::hasColumn('users', 'exam_start_at')) {
                $table->dropColumn('exam_start_at');
            }
        });
    }
};


