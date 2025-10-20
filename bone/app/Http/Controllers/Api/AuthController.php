<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Throwable;

class AuthController extends Controller
{
    /**
     * Inscription d'un candidat
     */
    public function register(Request $request)
    {
        // Accepter les payloads camelCase du frontend et les convertir en snake_case
        $request->merge([
            'first_name'       => $request->input('first_name', $request->input('firstName')),
            'last_name'        => $request->input('last_name', $request->input('lastName')),
            'date_of_birth'    => $request->input('date_of_birth', $request->input('birthDate')),
            'place_of_birth'   => $request->input('place_of_birth', $request->input('birthPlace')),
            'password_confirmation' => $request->input('password_confirmation', $request->input('confirmPassword')),
        ]);

        $validator = Validator::make($request->all(), [
            'first_name'       => 'required|string|max:255',
            'last_name'        => 'required|string|max:255',
            'email'            => 'required|string|email|max:255|unique:users,email',
            'phone'            => 'required|string|max:30',
            'password'         => 'required|string|min:6|confirmed',
            // Champs supplémentaires
            'address'          => 'nullable|string|max:255',
            'date_of_birth'    => 'nullable|date',
            'place_of_birth'   => 'nullable|string|max:255',
            'city'             => 'nullable|string|max:255',
            'country'          => 'nullable|string|max:255',
            'profession'       => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation échouée',
                'errors'  => $validator->errors(),
            ], 422);
        }
        try {
            $data = $validator->validated();
            $user = User::create([
                'first_name'     => $data['first_name'],
                'last_name'      => $data['last_name'],
                'email'          => $data['email'],
                'phone'          => $data['phone'],
                'password'       => Hash::make($request->password),
                'role'           => User::ROLE_CANDIDATE,
                'address'        => $data['address']        ?? null,
                'date_of_birth'  => $data['date_of_birth']  ?? null,
                'place_of_birth' => $data['place_of_birth'] ?? null,
                'city'           => $data['city']           ?? null,
                'country'        => $data['country']        ?? null,
                'profession'     => $data['profession']     ?? null,
                'is_active'      => true,
            ]);

            $token = auth('api')->login($user);

            return response()->json([
                'message'      => 'Inscription réussie',
                'access_token' => $token,
                'token_type'   => 'bearer',
                'expires_in'   => auth('api')->factory()->getTTL() * 60,
                'user'         => $user,
            ], 201);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'inscription',
                'error'   => config('app.debug') ? $e->getMessage() : 'Erreur interne',
            ], 500);
        }
    }

    /**
     * Connexion via email/mot de passe
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string|min:6',
            'remember' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation échouée',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $credentials = $validator->validated();
        
        // Option "remember" ignorée par défaut pour JWT (TTL géré via config)
        unset($credentials['remember']);

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect',
            ], 401);
        }

        $user = auth('api')->user();
        
        // Mettre à jour la dernière connexion
        $user->last_login_at = now();
        $user->save();

        return response()->json([
            'message'      => 'Connexion réussie',
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => auth('api')->factory()->getTTL() * 60,
            'user'         => auth('api')->user(),
        ]);
    }

    /**
     * Profil de l'utilisateur authentifié
     */
    public function me()
    {
        try {
            return response()->json(auth('api')->user());
        } catch (Throwable $e) {
            return response()->json(['message' => 'Token invalide ou expiré'], 401);
        }
    }

    public function logout()
    {
        try {
            auth('api')->logout();
            return response()->json(['message' => 'Déconnexion réussie']);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Déconnexion impossible: token invalide'], 401);
        }
    }

    /**
     * Rafraîchir le token
     */
    public function refresh()
    {
        try {
            $new = auth('api')->refresh();
            return response()->json([
                'message'      => 'Token rafraîchi',
                'access_token' => $new,
                'token_type'   => 'bearer',
                'expires_in'   => auth('api')->factory()->getTTL() * 60,
                'user'         => auth('api')->user(),
            ]);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Impossible de rafraîchir le token'], 401);
        }
    }
}
