<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'candidate_id',
        'answers',
        'status',
        'started_at',
        'submitted_at',
        'graded_at',
        'total_score',
        'examiner_id',
        'examiner_notes',
        'released_to_candidate',
        'released_at',
    ];

    protected $casts = [
        'answers' => 'array',
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'graded_at' => 'datetime',
        'total_score' => 'integer',
        'examiner_notes' => 'array',
        'released_to_candidate' => 'boolean',
        'released_at' => 'datetime',
    ];

    /**
     * Relation avec le candidat
     */
    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }

    /**
     * Relation avec l'examinateur
     */
    public function examiner()
    {
        return $this->belongsTo(User::class, 'examiner_id');
    }
}
