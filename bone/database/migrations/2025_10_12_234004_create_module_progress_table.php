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
        Schema::create('module_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained('users')->cascadeOnDelete();
            $table->string('certification_type');
            $table->string('module_id');
            $table->enum('status', ['locked', 'unlocked', 'in_progress', 'completed'])->default('locked');
            $table->timestamp('unlocked_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('score')->nullable();
            $table->integer('max_score')->nullable();
            $table->json('exam_submission_id')->nullable(); // ID de la soumission d'examen
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['candidate_id', 'certification_type']);
            $table->index(['candidate_id', 'module_id']);
            $table->unique(['candidate_id', 'certification_type', 'module_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('module_progress');
    }
};