<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExamQuestion;
use App\Models\ExamSubmission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Throwable;

class ExamController extends Controller
{
    /**
     * Publier un examen (couple certification/module):
     * - Marque les questions comme publiées
     * - Crée des soumissions draft pour les candidats actifs
     */
    public function publish(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'certification_type' => 'required|string|max:255',
            'module' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation échouée', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $cert = $data['certification_type'];
        $module = $data['module'];

        $examId = sprintf('exam-%s-%s', $cert, $module);

        try {
            $result = DB::transaction(function () use ($cert, $module, $examId) {
                $questions = ExamQuestion::where('certification_type', $cert)
                    ->where('module', $module)
                    ->get();

                if ($questions->isEmpty()) {
                    return [
                        'published_questions' => 0,
                        'created_submissions' => 0,
                        'message' => "Aucune question à publier pour {$cert}/{$module}",
                    ];
                }

                // Marquer comme publiées
                $published = ExamQuestion::where('certification_type', $cert)
                    ->where('module', $module)
                    ->where('is_published', false)
                    ->update([
                        'is_published' => true,
                        'published_at' => now(),
                    ]);

                // Créer des soumissions brouillon pour candidats actifs
                $candidates = User::where('role', User::ROLE_CANDIDATE)->where('is_active', true)->get(['id','first_name','last_name']);
                $created = 0;
                foreach ($candidates as $cand) {
                    $exists = ExamSubmission::where('exam_id', $examId)
                        ->where('candidate_id', $cand->id)
                        ->exists();
                    if ($exists) {
                        continue;
                    }
                    ExamSubmission::create([
                        'exam_id' => $examId,
                        'candidate_id' => $cand->id,
                        'answers' => [],
                        'status' => 'draft',
                        'started_at' => now(),
                        'total_score' => 0,
                    ]);
                    $created++;
                }

                return [
                    'published_questions' => (int) $published,
                    'created_submissions' => (int) $created,
                    'message' => 'Examen publié',
                ];
            });

            return response()->json($result);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Erreur lors de la publication',
                'error' => config('app.debug') ? $e->getMessage() : 'Erreur interne'
            ], 500);
        }
    }
}
