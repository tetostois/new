<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class EmailVerificationController extends Controller
{
    /**
     * Vérifier l'adresse email via lien signé.
     */
    public function verify(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        // Le middleware 'signed' protège déjà l'URL, on double-vérifie le hash par sécurité
        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Lien de vérification invalide.'], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié.']);
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        // Optionnel: rediriger vers une URL frontend si fournie
        $redirect = $request->query('redirect');
        if ($redirect && URL::isValidUrl($redirect)) {
            return redirect($redirect . '?verified=1');
        }

        return response()->json(['message' => 'Email vérifié avec succès.']);
    }

    /**
     * Renvoyer l'email de vérification pour l'utilisateur authentifié (JWT).
     */
    public function resend(Request $request)
    {
        $user = auth('api')->user();
        if (! $user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié.']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Email de vérification renvoyé.']);
    }
}


