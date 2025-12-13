<?php

namespace App\Http\Controllers\Api\Candidate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TermsController extends Controller
{
    /**
     * Enregistrer l'acceptation des conditions d'examen pour la certification sélectionnée.
     */
    public function accept(Request $request)
    {
        $user = $request->user();

        // Vérifier préconditions: certification choisie et paiement effectué
        if (!$user->selected_certification) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune certification sélectionnée.',
            ], 422);
        }
        if (!$user->has_paid) {
            return response()->json([
                'success' => false,
                'message' => 'Paiement requis avant acceptation des conditions.',
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'certification_type' => 'sometimes|string',
            'module_id' => 'sometimes|string|nullable',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Paramètres invalides.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $cert = $request->get('certification_type') ?: $user->selected_certification;

        // Enregistrer l'acceptation (horodatage + certification concernée)
        $user->exam_terms_accepted_at = now();
        $user->exam_terms_certification_type = $cert;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Conditions d\'examen acceptées.',
            'user' => $user->fresh(),
        ]);
    }
}


