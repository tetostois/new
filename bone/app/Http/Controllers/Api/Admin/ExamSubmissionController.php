<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExamSubmission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExamSubmissionController extends Controller
{
    /**
     * Lister toutes les soumissions d'examen avec filtres.
     */
    public function index(Request $request)
    {
        $query = ExamSubmission::with(['candidate', 'examiner']);

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->has('certification_type')) {
            $query->where('exam_id', 'like', 'exam-' . $request->input('certification_type') . '%');
        }
        if ($request->has('module_id')) {
            $query->where('exam_id', 'like', '%' . $request->input('module_id'));
        }
        if ($request->has('examiner_id')) {
            $query->where('examiner_id', $request->input('examiner_id'));
        }

        $perPage = (int) $request->query('per_page', 20);
        $perPage = $perPage > 0 ? min($perPage, 100) : 20;
        $submissions = $query->orderBy('submitted_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $submissions->items(),
            'pagination' => [
                'current_page' => $submissions->currentPage(),
                'per_page' => $submissions->perPage(),
                'total' => $submissions->total(),
                'last_page' => $submissions->lastPage(),
                'from' => $submissions->firstItem(),
                'to' => $submissions->lastItem(),
            ],
        ]);
    }

    /**
     * Afficher une soumission spécifique.
     */
    public function show(string $id)
    {
        $submission = ExamSubmission::with(['candidate', 'examiner'])->find($id);

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
     * Assigner un examinateur à une soumission.
     */
    public function assign(Request $request, string $id)
    {
        $validated = $request->validate([
            'examiner_id' => 'required|exists:users,id',
        ]);

        try {
            $submission = ExamSubmission::findOrFail($id);
            $examiner = User::findOrFail($validated['examiner_id']);

            if ($examiner->role !== User::ROLE_EXAMINER) {
                return response()->json([
                    'success' => false,
                    'message' => 'L\'utilisateur assigné n\'est pas un examinateur.',
                ], 400);
            }

            $submission->update([
                'examiner_id' => $validated['examiner_id'],
                'status' => 'under_review',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Examinateur assigné avec succès.',
                'submission' => $submission,
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'assignation de l\'examinateur : ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de l\'assignation.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtenir des statistiques sur les soumissions.
     */
    public function stats()
    {
        $total = ExamSubmission::count();
        $submitted = ExamSubmission::where('status', 'submitted')->count();
        $underReview = ExamSubmission::where('status', 'under_review')->count();
        $graded = ExamSubmission::where('status', 'graded')->count();

        return response()->json([
            'success' => true,
            'total' => $total,
            'submitted' => $submitted,
            'under_review' => $underReview,
            'graded' => $graded,
        ]);
    }

    /**
     * Obtenir la liste des examinateurs disponibles.
     */
    public function availableExaminers()
    {
        $examiners = User::where('role', User::ROLE_EXAMINER)
                        ->where('is_active', true)
                        ->select('id', 'first_name', 'last_name', 'email')
                        ->get();

        return response()->json([
            'success' => true,
            'examiners' => $examiners,
        ]);
    }
}

