<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'certification_type',
        'module',
        'question_type',
        'question_text',
        'reference_answer',
        'instructions',
        'points',
        'time_limit',
        'is_required',
        'answer_options',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_published' => 'boolean',
        'answer_options' => 'array',
        'published_at' => 'datetime',
    ];
}
