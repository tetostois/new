<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('exam_id'); // ex: exam-{certificationType}-{module}
            $table->foreignId('candidate_id')->constrained('users')->cascadeOnDelete();
            $table->json('answers')->nullable();
            $table->enum('status', ['draft','submitted','under_review','graded'])->default('draft');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('graded_at')->nullable();
            $table->unsignedInteger('total_score')->default(0);
            $table->foreignId('examiner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['exam_id','status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_submissions');
    }
};
