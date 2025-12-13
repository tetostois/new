<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exam_submissions', function (Blueprint $table) {
            if (!Schema::hasColumn('exam_submissions', 'examiner_notes')) {
                // Assurer la présence de la colonne attendue par le code
                $table->json('examiner_notes')->nullable();
            }
            if (!Schema::hasColumn('exam_submissions', 'released_to_candidate')) {
                $table->boolean('released_to_candidate')->default(false);
            }
            if (!Schema::hasColumn('exam_submissions', 'released_at')) {
                $table->timestamp('released_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('exam_submissions', function (Blueprint $table) {
            if (Schema::hasColumn('exam_submissions', 'released_at')) {
                $table->dropColumn('released_at');
            }
            if (Schema::hasColumn('exam_submissions', 'released_to_candidate')) {
                $table->dropColumn('released_to_candidate');
            }
            // Ne pas supprimer examiner_notes si elle existait déjà auparavant
        });
    }
};


