<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExamQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PublishExamController extends Controller
{

    public function publish(Request $request)
    {
        $validated = $request->validate([
            'certification_type' => 'required|string',
            'module' => 'required|string',
            'question_ids' => 'required|array',
            'question_ids.*' => 'integer|exists:exam_questions,id',
        ]);

        try {
            DB::beginTransaction();

            // Dépublier toutes les questions existantes pour cette certification et ce module
            ExamQuestion::where('certification_type', $validated['certification_type'])
                ->where('module', $validated['module'])
                ->update([
                    'is_published' => false,
                    'published_at' => null
                ]);

            // Publier les nouvelles questions sélectionnées
            ExamQuestion::whereIn('id', $validated['question_ids'])
                ->update([
                    'is_published' => true,
                    'published_at' => now()
                ]);

            $publishedCount = count($validated['question_ids']);
            
            DB::commit();

            return response()->json([
                'message' => 'Examen publié avec succès',
                'published_count' => $publishedCount
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erreur lors de la publication de l\'examen : ' . $e->getMessage());
            return response()->json([
                'message' => 'Une erreur est survenue lors de la publication',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
