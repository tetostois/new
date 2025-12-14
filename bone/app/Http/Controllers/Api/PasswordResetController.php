<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Demande de réinitialisation: envoie un email si l'utilisateur existe.
     */
    public function forgot(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $email = strtolower($request->input('email'));
        $user = User::where('email', $email)->first();

        // Toujours répondre OK pour ne pas divulguer l'existence de l'email
        $okResponse = response()->json(['success' => true, 'message' => 'Si un compte existe, un email a été envoyé.']);

        if (!$user) {
            return $okResponse;
        }

        // Invalider les anciens tokens
        DB::table('password_resets')->where('email', $email)->delete();

        $token = Str::random(64);
        $expiresAt = now()->addMinutes(config('auth.passwords.users.expire', 60));

        DB::table('password_resets')->insert([
            'email' => $email,
            'token' => $token,
            'expires_at' => $expiresAt,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // URL du frontend pour réinitialiser
        $frontend = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));
        $resetUrl = rtrim($frontend, '/') . "/reset-password?token={$token}&email=" . urlencode($email);

        // Envoi d'email simple
        try {
            Mail::raw("Bonjour,\n\nPour réinitialiser votre mot de passe, cliquez sur le lien suivant:\n{$resetUrl}\n\nCe lien expire dans 60 minutes.\n\nCordialement.", function ($m) use ($email) {
                $m->to($email)->subject('Réinitialisation de mot de passe');
            });
        } catch (\Throwable $e) {
            // Ne pas divulguer d'erreur côté client
        }

        return $okResponse;
    }

    /**
     * Réinitialiser le mot de passe avec un token valide.
     */
    public function reset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $email = strtolower($request->input('email'));
        $token = $request->input('token');

        $row = DB::table('password_resets')
            ->where('email', $email)
            ->where('token', $token)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->first();

        if (!$row) {
            return response()->json(['success' => false, 'message' => 'Lien invalide ou expiré'], 422);
        }

        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Compte introuvable'], 404);
        }

        $user->password = Hash::make($request->input('password'));
        $user->save();

        // Marquer le token utilisé et nettoyer
        DB::table('password_resets')->where('email', $email)->update(['used_at' => now()]);

        return response()->json(['success' => true, 'message' => 'Mot de passe réinitialisé avec succès']);
    }
}


