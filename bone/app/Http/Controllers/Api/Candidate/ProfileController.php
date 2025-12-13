<?php

namespace App\Http\Controllers\Api\Candidate;

use App\Http\Controllers\Controller;
use App\Models\ModuleProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * Met à jour le type de certification sélectionné par le candidat.
     * Règle métier: si un paiement a été validé (has_paid = true) ou si une
     * progression de module existe pour une certification, interdire le changement.
     */
    public function updateCertification(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }
        if (!$user->isCandidate()) {
            return response()->json(['success' => false, 'message' => 'Réservé aux candidats'], 403);
        }

        $validator = Validator::make($request->all(), [
            'selected_certification' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation échouée',
                'errors' => $validator->errors(),
            ], 422);
        }

        $new = $validator->validated()['selected_certification'];
        $current = $user->selected_certification;

        // Verrou 1: paiement validé
        if ($user->has_paid && $current && $new !== $current) {
            return response()->json([
                'success' => false,
                'message' => 'La certification est verrouillée après paiement. Modification interdite.',
            ], 403);
        }

        // Verrou 2 (défensif): si une progression existe déjà pour une autre certification
        $hasProgress = ModuleProgress::where('candidate_id', $user->id)->exists();
        if ($hasProgress && $current && $new !== $current) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà commencé des modules. Changement de certification interdit.',
            ], 403);
        }

        $user->selected_certification = $new;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Certification mise à jour',
            'user' => $user,
        ]);
    }

    /**
     * Marquer le candidat comme ayant payé (utilisé par le flux de paiement simulé).
     */
    public function markPaid(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }
        if (!$user->isCandidate()) {
            return response()->json(['success' => false, 'message' => 'Réservé aux candidats'], 403);
        }

        // Marquer le paiement comme effectué
        $user->has_paid = true;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Statut de paiement mis à jour',
            'user' => $user,
        ]);
    }
}
