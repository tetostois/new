<?php

namespace App\Http\Controllers\Api\Examiner;

use App\Http\Controllers\Controller;
use App\Models\ExamSubmission;
use App\Models\ExamQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExamSubmissionController extends Controller
{
    /**
     * Lister les soumissions assignées à l'examinateur connecté.
     */
    public function index(Request $request)
    {
        $examinerId = auth()->id();
        $query = ExamSubmission::with(['candidate'])
                                ->where('examiner_id', $examinerId)
                                ->whereIn('status', ['under_review', 'graded']);

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $submissions = $query->orderBy('submitted_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'submissions' => $submissions,
        ]);
    }

    /**
     * Afficher une soumission spécifique avec les questions et réponses de référence.
     */
    public function show(string $id)
    {
        $examinerId = auth()->id();
        $submission = ExamSubmission::with(['candidate'])
                                    ->where('id', $id)
                                    ->where('examiner_id', $examinerId)
                                    ->first();

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Soumission non trouvée ou non assignée à cet examinateur.',
            ], 404);
        }

        // Extraire certification_type et module_id de exam_id
        preg_match('/^exam-(.*?)-(.*?)$/', $submission->exam_id, $matches);
        $certificationType = $matches[1] ?? null;
        $moduleId = $matches[2] ?? null;

        if (!$certificationType || !$moduleId) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de déterminer le type de certification ou le module pour cette soumission.',
            ], 500);
        }

        // Récupérer les questions de l'examen avec les réponses de référence et les points
        $questions = ExamQuestion::where('certification_type', $certificationType)
                                ->where('module', $moduleId)
                                ->get()
                                ->keyBy('id');

        $submissionDetails = $submission->toArray();
        $submissionDetails['questions_details'] = [];

        foreach ($submission->answers as $questionId => $candidateAnswer) {
            $question = $questions->get($questionId);
            if ($question) {
                $submissionDetails['questions_details'][] = [
                    'question_id' => $question->id,
                    'question_text' => $question->question_text,
                    'question_type' => $question->question_type,
                    'candidate_answer' => $candidateAnswer,
                    'reference_answer' => $question->reference_answer, // Réponse de référence
                    'instructions' => $question->instructions,         // Instructions supplémentaires
                    'points_possible' => $question->points,             // Points assignés
                    'answer_options' => $question->answer_options,     // Options pour QCM
                ];
            }
        }

        return response()->json([
            'success' => true,
            'submission' => $submissionDetails,
        ]);
    }

    /**
     * Noter une soumission d'examen.
     */
    public function grade(Request $request, string $id)
    {
        $validated = $request->validate([
            'grades' => 'required|array',
            'grades.*.question_id' => 'required|exists:exam_questions,id',
            'grades.*.score' => 'required|integer|min:0',
            'grades.*.feedback' => 'nullable|string',
            'total_score' => 'required|integer|min:0',
        ]);

        $examinerId = auth()->id();

        try {
            DB::beginTransaction();

            $submission = ExamSubmission::where('id', $id)
                                        ->where('examiner_id', $examinerId)
                                        ->where('status', 'under_review')
                                        ->firstOrFail();

            // Plafonner chaque note au nombre de points de la question
            // Extraire certification_type et module_id depuis exam_id
            preg_match('/^exam-(.*?)-(.*?)$/', $submission->exam_id, $matches);
            $certificationType = $matches[1] ?? null;
            $moduleId = $matches[2] ?? null;

            // Récupérer les points par question pour ce couple certification/module
            $questionsById = ExamQuestion::where('certification_type', $certificationType)
                                         ->where('module', $moduleId)
                                         ->pluck('points', 'id');

            $examinerNotes = [];
            $computedTotal = 0;
            foreach ($validated['grades'] as $grade) {
                $questionId = (int) $grade['question_id'];
                $maxPoints = (int) ($questionsById[$questionId] ?? 0);
                $rawScore = (int) $grade['score'];
                $cappedScore = max(0, min($rawScore, $maxPoints));

                $examinerNotes[$questionId] = [
                    'score' => $cappedScore,
                    'feedback' => $grade['feedback'] ?? null,
                ];
                $computedTotal += $cappedScore;
            }

            $submission->update([
                'status' => 'graded',
                'graded_at' => now(),
                // Utiliser le total calculé et plafonné côté serveur
                'total_score' => $computedTotal,
                'examiner_notes' => $examinerNotes, // Stocker les notes de l'examinateur
            ]);

            // Mettre à jour la progression du module pour refléter le score final
            $moduleProgress = \App\Models\ModuleProgress::where('candidate_id', $submission->candidate_id)
                                                       ->where('exam_submission_id', $submission->id)
                                                       ->first();
            if ($moduleProgress) {
                $moduleProgress->update([
                    // Synchroniser avec le total plafonné
                    'score' => $computedTotal,
                    'status' => 'completed', // Le module est considéré comme complété après notation
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Soumission notée avec succès.',
                'submission' => $submission,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la notation de la soumission : ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la notation.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtenir des statistiques pour l'examinateur.
     */
    public function stats()
    {
        $examinerId = auth()->id();
        $assigned = ExamSubmission::where('examiner_id', $examinerId)->count();
        $underReview = ExamSubmission::where('examiner_id', $examinerId)->where('status', 'under_review')->count();
        $graded = ExamSubmission::where('examiner_id', $examinerId)->where('status', 'graded')->count();

        return response()->json([
            'success' => true,
            'stats' => [
                'total_assigned' => $assigned,
                'pending' => $underReview,
                'graded' => $graded,
                'average_score' => 0, // TODO: Calculer la moyenne des scores
            ]
        ]);
    }
}