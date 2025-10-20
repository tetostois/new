<?php

namespace App\Http\Controllers\Api\Candidate;

use App\Http\Controllers\Controller;
use App\Models\ExamQuestion;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function index(Request $request)
    {
        // Accepter 'certification' ou 'certification_type' pour compatibilité
        $validated = $request->validate([
            'certification' => 'sometimes|string',
            'certification_type' => 'sometimes|string',
            'module' => 'required|string',
        ]);

        $certification = $validated['certification']
            ?? $validated['certification_type']
            ?? $request->get('certification')
            ?? $request->get('certification_type');
        if (!$certification) {
            return response()->json([
                'success' => false,
                'message' => 'Le paramètre certification est requis',
            ], 422);
        }

        $questions = ExamQuestion::query()
            ->where('certification_type', $certification)
            ->where('module', $validated['module'])
            ->where('is_published', true)
            ->orderBy('created_at')
            ->get()
            ->map(function ($question) {
                return [
                    'id' => $question->id,
                    'question_type' => $question->question_type,
                    'question_text' => $question->question_text,
                    'instructions' => $question->instructions,
                    'points' => $question->points,
                    'time_limit' => $question->time_limit,
                    'is_required' => $question->is_required,
                    'answer_options' => $question->answer_options,
                    'created_at' => $question->created_at,
                    'updated_at' => $question->updated_at,
                ];
            });

        return response()->json([
            'success' => true,
            'questions' => $questions,
            'total' => $questions->count(),
        ]);
    }
}
