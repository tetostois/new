<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModuleProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'candidate_id',
        'certification_type',
        'module_id',
        'status',
        'unlocked_at',
        'started_at',
        'completed_at',
        'score',
        'max_score',
        'exam_submission_id',
    ];

    protected $casts = [
        'unlocked_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'score' => 'integer',
        'max_score' => 'integer',
        'exam_submission_id' => 'array',
    ];

    /**
     * Relation avec le candidat
     */
    public function candidate(): BelongsTo
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }

    /**
     * Relation avec la soumission d'examen
     */
    public function examSubmission(): BelongsTo
    {
        return $this->belongsTo(ExamSubmission::class, 'exam_submission_id');
    }

    /**
     * Vérifie si le module est déverrouillé
     */
    public function isUnlocked(): bool
    {
        return in_array($this->status, ['unlocked', 'in_progress', 'completed']);
    }

    /**
     * Vérifie si le module est en cours
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Vérifie si le module est terminé
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Vérifie si le module est verrouillé
     */
    public function isLocked(): bool
    {
        return $this->status === 'locked';
    }

    /**
     * Déverrouille le module
     */
    public function unlock(): void
    {
        $this->update([
            'status' => 'unlocked',
            'unlocked_at' => now(),
        ]);
    }

    /**
     * Marque le module comme en cours
     */
    public function start(): void
    {
        $this->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
    }

    /**
     * Marque le module comme terminé
     */
    public function complete(int $score = null, int $maxScore = null): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'score' => $score,
            'max_score' => $maxScore,
        ]);
    }

    /**
     * Obtient le pourcentage de réussite
     */
    public function getSuccessPercentage(): ?float
    {
        if (!$this->score || !$this->max_score) {
            return null;
        }

        return round(($this->score / $this->max_score) * 100, 2);
    }
}