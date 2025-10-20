<?php

namespace App\Http\Controllers\Api\Candidate;

use App\Http\Controllers\Controller;
use App\Models\ExamSubmission;
use App\Models\ModuleProgress;
use App\Models\ExamQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExamSubmissionController extends Controller
{
    /**
     * Soumettre un examen et déverrouiller le module suivant
     */
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'exam_id' => 'required|string',
            'answers' => 'required|array',
            'certification_type' => 'required|string',
            'module_id' => 'required|string',
        ]);

        $candidateId = auth()->id();

        try {
            DB::beginTransaction();

            // Récupérer ou créer la soumission d'examen
            $submission = ExamSubmission::where('exam_id', $validated['exam_id'])
                ->where('candidate_id', $candidateId)
                ->first();

            if (!$submission) {
                // Créer une nouvelle soumission d'examen
                $submission = ExamSubmission::create([
                    'exam_id' => $validated['exam_id'],
                    'candidate_id' => $candidateId,
                    'answers' => [],
                    'status' => 'draft',
                    'started_at' => now(),
                    'total_score' => 0,
                ]);
            }

            // Calculer le score
            $score = $this->calculateScore($validated['answers'], $validated['certification_type'], $validated['module_id']);
            $maxScore = $this->getMaxScore($validated['certification_type'], $validated['module_id']);

            // Mettre à jour la soumission
            $submission->update([
                'answers' => $validated['answers'],
                'status' => 'submitted',
                'submitted_at' => now(),
                'total_score' => $score,
            ]);

            // Marquer le module comme terminé dans la progression
            $moduleProgress = ModuleProgress::where('candidate_id', $candidateId)
                ->where('certification_type', $validated['certification_type'])
                ->where('module_id', $validated['module_id'])
                ->first();

            if ($moduleProgress) {
                $moduleProgress->complete($score, $maxScore);
                $moduleProgress->update(['exam_submission_id' => $submission->id]);
            } else {
                // Créer la progression si elle n'existe pas
                ModuleProgress::create([
                    'candidate_id' => $candidateId,
                    'certification_type' => $validated['certification_type'],
                    'module_id' => $validated['module_id'],
                    'status' => 'completed',
                    'completed_at' => now(),
                    'score' => $score,
                    'max_score' => $maxScore,
                    'exam_submission_id' => $submission->id,
                ]);
            }

            // Déverrouiller le module suivant
            $this->unlockNextModule($candidateId, $validated['certification_type'], $validated['module_id']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Examen soumis avec succès',
                'submission' => $submission,
                'score' => $score,
                'max_score' => $maxScore,
                'percentage' => $maxScore > 0 ? round(($score / $maxScore) * 100, 2) : 0,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erreur lors de la soumission de l\'examen : ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la soumission',
            ], 500);
        }
    }

    /**
     * Obtenir les soumissions d'examen d'un candidat
     */
    public function index(Request $request)
    {
        $candidateId = auth()->id();
        $certificationType = $request->get('certification_type');
        $moduleId = $request->get('module_id');

        $query = ExamSubmission::where('candidate_id', $candidateId);

        if ($certificationType) {
            $query->where('exam_id', 'like', "exam-{$certificationType}%");
        }

        if ($moduleId) {
            $query->where('exam_id', 'like', "%-{$moduleId}");
        }

        $submissions = $query->orderBy('submitted_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'submissions' => $submissions,
        ]);
    }

    /**
     * Obtenir une soumission spécifique
     */
    public function show(Request $request, string $examId)
    {
        $candidateId = auth()->id();

        $submission = ExamSubmission::where('exam_id', $examId)
            ->where('candidate_id', $candidateId)
            ->first();

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Soumission non trouvée',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'submission' => $submission,
        ]);
    }

    /**
     * Calculer le score d'un examen
     */
    private function calculateScore(array $answers, string $certificationType, string $moduleId): int
    {
        $questions = ExamQuestion::where('certification_type', $certificationType)
            ->where('module', $moduleId)
            ->where('is_published', true)
            ->get();

        $totalScore = 0;

        foreach ($questions as $question) {
            $questionId = $question->id;
            $userAnswer = $answers[$questionId] ?? null;

            if ($userAnswer === null) {
                continue; // Question non répondue
            }

            if ($question->question_type === 'qcm') {
                // Pour les QCM, vérifier si la réponse est correcte
                $correctAnswer = $question->correct_answer;
                if ($userAnswer === $correctAnswer) {
                    $totalScore += $question->points;
                }
            } else {
                // Pour les questions à texte libre, attribuer les points complets
                // (l'évaluation manuelle sera faite par un examinateur)
                $totalScore += $question->points;
            }
        }

        return $totalScore;
    }

    /**
     * Obtenir le score maximum possible
     */
    private function getMaxScore(string $certificationType, string $moduleId): int
    {
        return ExamQuestion::where('certification_type', $certificationType)
            ->where('module', $moduleId)
            ->where('is_published', true)
            ->sum('points');
    }

    /**
     * Déverrouiller le module suivant
     */
    private function unlockNextModule(int $candidateId, string $certificationType, string $currentModuleId)
    {
        // Définir l'ordre des modules pour chaque certification
        $moduleOrder = [
            'initiation_pratique_generale' => [
                'leadership',
                'competences_professionnelles',
                'entrepreneuriat'
            ],
            'cadre_manager_professionnel' => [
                'leadership',
                'competences_professionnelles',
                'entrepreneuriat'
            ],
            'rentabilite_entrepreneuriale' => [
                'leadership',
                'competences_professionnelles',
                'entrepreneuriat'
            ],
            'chef_dirigeant_entreprise_africaine' => [
                'leadership',
                'competences_professionnelles',
                'entrepreneuriat'
            ],
            'investisseur_entreprises_africaines' => [
                'leadership',
                'competences_professionnelles',
                'entrepreneuriat'
            ],
            'ingenieries_specifiques' => [
                'leadership',
                'competences_professionnelles',
                'entrepreneuriat'
            ]
        ];

        if (!isset($moduleOrder[$certificationType])) {
            return;
        }

        $modules = $moduleOrder[$certificationType];
        $currentIndex = array_search($currentModuleId, $modules);

        if ($currentIndex === false || $currentIndex >= count($modules) - 1) {
            // C'est le dernier module ou le module n'existe pas
            return;
        }

        $nextModuleId = $modules[$currentIndex + 1];

        // Vérifier si le module suivant n'est pas déjà déverrouillé
        $nextProgress = ModuleProgress::where('candidate_id', $candidateId)
            ->where('certification_type', $certificationType)
            ->where('module_id', $nextModuleId)
            ->first();

        if (!$nextProgress || $nextProgress->isLocked()) {
            // Déverrouiller le module suivant
            ModuleProgress::updateOrCreate(
                [
                    'candidate_id' => $candidateId,
                    'certification_type' => $certificationType,
                    'module_id' => $nextModuleId,
                ],
                [
                    'status' => 'unlocked',
                    'unlocked_at' => now(),
                ]
            );
        }
    }
}