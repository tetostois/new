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
            if (!Schema::hasColumn('users', 'exam_terms_accepted_at')) {
                $table->timestamp('exam_terms_accepted_at')->nullable()->after('has_paid');
            }
            if (!Schema::hasColumn('users', 'exam_terms_certification_type')) {
                $table->string('exam_terms_certification_type')->nullable()->after('exam_terms_accepted_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'exam_terms_certification_type')) {
                $table->dropColumn('exam_terms_certification_type');
            }
            if (Schema::hasColumn('users', 'exam_terms_accepted_at')) {
                $table->dropColumn('exam_terms_accepted_at');
            }
        });
    }
};


