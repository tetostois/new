<?php

namespace App\Http\Controllers\Api\Candidate;

use App\Http\Controllers\Controller;
use App\Models\ModuleProgress;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ModuleProgressController extends Controller
{
    /**
     * Obtenir la progression des modules pour un candidat
     */
    public function index(Request $request)
    {
        $candidateId = auth()->id();
        $certificationType = $request->get('certification_type');

        $query = ModuleProgress::where('candidate_id', $candidateId);

        if ($certificationType) {
            $query->where('certification_type', $certificationType);
        }

        $progress = $query->orderBy('created_at')->get();

        return response()->json([
            'success' => true,
            'progress' => $progress,
        ]);
    }

    /**
     * Obtenir le statut d'un module spécifique
     */
    public function show(Request $request, string $certificationType, string $moduleId)
    {
        $candidateId = auth()->id();

        $progress = ModuleProgress::where('candidate_id', $candidateId)
            ->where('certification_type', $certificationType)
            ->where('module_id', $moduleId)
            ->first();

        if (!$progress) {
            return response()->json([
                'success' => false,
                'message' => 'Progression du module non trouvée',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'progress' => $progress,
        ]);
    }

    /**
     * Déverrouiller un module
     */
    public function unlock(Request $request)
    {
        $validated = $request->validate([
            'certification_type' => 'required|string',
            'module_id' => 'required|string',
        ]);

        $candidateId = auth()->id();

        try {
            DB::beginTransaction();

            // Vérifier si le module est déjà déverrouillé
            $existingProgress = ModuleProgress::where('candidate_id', $candidateId)
                ->where('certification_type', $validated['certification_type'])
                ->where('module_id', $validated['module_id'])
                ->first();

            if ($existingProgress && $existingProgress->isUnlocked()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce module est déjà déverrouillé',
                ], 400);
            }

            // Créer ou mettre à jour la progression
            $progress = ModuleProgress::updateOrCreate(
                [
                    'candidate_id' => $candidateId,
                    'certification_type' => $validated['certification_type'],
                    'module_id' => $validated['module_id'],
                ],
                [
                    'status' => 'unlocked',
                    'unlocked_at' => now(),
                ]
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Module déverrouillé avec succès',
                'progress' => $progress,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erreur lors du déverrouillage du module : ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors du déverrouillage',
            ], 500);
        }
    }

    /**
     * Marquer un module comme en cours
     */
    public function start(Request $request)
    {
        $validated = $request->validate([
            'certification_type' => 'required|string',
            'module_id' => 'required|string',
        ]);

        $candidateId = auth()->id();

        try {
            $progress = ModuleProgress::where('candidate_id', $candidateId)
                ->where('certification_type', $validated['certification_type'])
                ->where('module_id', $validated['module_id'])
                ->first();

            if (!$progress) {
                return response()->json([
                    'success' => false,
                    'message' => 'Progression du module non trouvée',
                ], 404);
            }

            if ($progress->isLocked()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce module est verrouillé',
                ], 400);
            }

            $progress->start();

            return response()->json([
                'success' => true,
                'message' => 'Module démarré avec succès',
                'progress' => $progress,
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur lors du démarrage du module : ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors du démarrage',
            ], 500);
        }
    }

    /**
     * Marquer un module comme terminé
     */
    public function complete(Request $request)
    {
        $validated = $request->validate([
            'certification_type' => 'required|string',
            'module_id' => 'required|string',
            'score' => 'nullable|integer|min:0',
            'max_score' => 'nullable|integer|min:1',
            'exam_submission_id' => 'nullable|integer',
        ]);

        $candidateId = auth()->id();

        try {
            DB::beginTransaction();

            $progress = ModuleProgress::where('candidate_id', $candidateId)
                ->where('certification_type', $validated['certification_type'])
                ->where('module_id', $validated['module_id'])
                ->first();

            if (!$progress) {
                return response()->json([
                    'success' => false,
                    'message' => 'Progression du module non trouvée',
                ], 404);
            }

            if ($progress->isCompleted()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce module est déjà terminé',
                ], 400);
            }

            // Marquer le module comme terminé
            $progress->complete(
                $validated['score'] ?? null,
                $validated['max_score'] ?? null
            );

            // Mettre à jour l'exam_submission_id si fourni
            if (isset($validated['exam_submission_id'])) {
                $progress->update(['exam_submission_id' => $validated['exam_submission_id']]);
            }

            // Déverrouiller le module suivant si c'est le dernier module de la certification
            $this->unlockNextModule($candidateId, $validated['certification_type'], $validated['module_id']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Module terminé avec succès',
                'progress' => $progress,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erreur lors de la finalisation du module : ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la finalisation',
            ], 500);
        }
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
                'gestion_equipe',
                'communication',
                'planification',
                'evaluation'
            ],
            'perfectionnement_avance' => [
                'strategie_avancee',
                'innovation',
                'gestion_risques',
                'leadership_transformational',
                'excellence_operationnelle'
            ],
            'expertise_specialisee' => [
                'expertise_metier',
                'recherche_developpement',
                'conseil_strategique',
                'formation_mentorat',
                'innovation_continue'
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