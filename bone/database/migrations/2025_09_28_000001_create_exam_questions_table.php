<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_questions', function (Blueprint $table) {
            $table->id();
            $table->string('certification_type');
            $table->string('module');
            $table->enum('question_type', ['qcm', 'free_text']);
            $table->text('question_text');
            $table->text('reference_answer')->nullable();
            $table->text('instructions')->nullable();
            $table->unsignedInteger('points')->default(1);
            $table->unsignedInteger('time_limit')->default(60); // seconds
            $table->boolean('is_required')->default(true);
            $table->json('answer_options')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->index(['certification_type', 'module']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_questions');
    }
};
