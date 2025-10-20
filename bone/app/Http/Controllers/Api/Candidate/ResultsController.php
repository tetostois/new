<?php

namespace App\Http\Controllers\Api\Candidate;

use App\Http\Controllers\Controller;
use App\Models\ExamSubmission;
use App\Models\ModuleProgress;
use Illuminate\Http\Request;

class ResultsController extends Controller
{
    /**
     * Récupérer les résultats de tous les modules d'un candidat
     */
    public function index(Request $request)
    {
        $candidateId = auth()->id();
        
        // Récupérer toutes les soumissions du candidat
        $submissions = ExamSubmission::where('candidate_id', $candidateId)
            ->where('status', 'graded')
            ->orderBy('submitted_at', 'desc')
            ->get();

        // Grouper par certification et module
        $results = [];
        
        foreach ($submissions as $submission) {
            // Extraire certification_type et module_id de exam_id
            preg_match('/^exam-(.*?)-(.*?)$/', $submission->exam_id, $matches);
            $certificationType = $matches[1] ?? null;
            $moduleId = $matches[2] ?? null;
            
            if (!$certificationType || !$moduleId) {
                continue;
            }
            
            // Mapper les IDs vers les noms affichés
            $moduleNames = [
                'leadership' => 'Leadership',
                'competences_professionnelles' => 'Compétences Professionnelles',
                'entrepreneuriat' => 'Entrepreneuriat'
            ];
            
            $certificationNames = [
                'initiation_pratique_generale' => 'Certification d\'Initiation Pratique Générale',
                'cadre_manager_professionnel' => 'Cadre Manager Professionnel',
                'rentabilite_entrepreneuriale' => 'Rentabilité Entrepreneuriale',
                'chef_dirigeant_entreprise_africaine' => 'Chef Dirigeant d\'Entreprise Africaine',
                'investisseur_entreprises_africaines' => 'Investisseur d\'Entreprises Africaines',
                'ingenieries_specifiques' => 'Ingénieries Spécifiques'
            ];
            
            if (!isset($results[$certificationType])) {
                $results[$certificationType] = [
                    'certification_name' => $certificationNames[$certificationType] ?? $certificationType,
                    'modules' => [],
                    'total_score' => 0,
                    'max_score' => 0,
                    'average_score' => 0
                ];
            }
            
            // Calculer le score maximum pour ce module (20 questions × points par question)
            $maxModuleScore = 100; // Score maximum par module
            
            $results[$certificationType]['modules'][$moduleId] = [
                'module_name' => $moduleNames[$moduleId] ?? $moduleId,
                'score' => $submission->total_score,
                'max_score' => $maxModuleScore,
                'percentage' => round(($submission->total_score / $maxModuleScore) * 100, 1),
                'submitted_at' => $submission->submitted_at,
                'graded_at' => $submission->graded_at,
                'examiner_notes' => $submission->examiner_notes,
                'status' => $submission->status
            ];
            
            $results[$certificationType]['total_score'] += $submission->total_score;
            $results[$certificationType]['max_score'] += $maxModuleScore;
        }
        
        // Calculer la moyenne pour chaque certification
        foreach ($results as $certificationType => &$certification) {
            if ($certification['max_score'] > 0) {
                $certification['average_score'] = round(($certification['total_score'] / $certification['max_score']) * 100, 1);
            }
        }
        
        return response()->json([
            'success' => true,
            'results' => $results,
        ]);
    }
    
    /**
     * Récupérer les détails d'un module spécifique
     */
    public function show(Request $request, string $moduleId)
    {
        $candidateId = auth()->id();
        
        // Récupérer la soumission du module
        $submission = ExamSubmission::where('candidate_id', $candidateId)
            ->where('exam_id', 'like', '%-' . $moduleId)
            ->where('status', 'graded')
            ->first();
            
        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Module non trouvé ou pas encore corrigé',
            ], 404);
        }
        
        // Extraire certification_type de exam_id
        preg_match('/^exam-(.*?)-(.*?)$/', $submission->exam_id, $matches);
        $certificationType = $matches[1] ?? null;
        
        return response()->json([
            'success' => true,
            'module' => [
                'id' => $moduleId,
                'certification_type' => $certificationType,
                'score' => $submission->total_score,
                'max_score' => 100,
                'percentage' => round(($submission->total_score / 100) * 100, 1),
                'submitted_at' => $submission->submitted_at,
                'graded_at' => $submission->graded_at,
                'examiner_notes' => $submission->examiner_notes,
                'answers' => $submission->answers
            ]
        ]);
    }
}
