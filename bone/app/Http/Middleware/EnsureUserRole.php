<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Handle an incoming request.
     * Usage: role:admin or role:examiner,candidate
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        try {
            $user = auth('api')->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non authentifié. Veuillez vous connecter.'
                ], 401);
            }

            // Si aucun rôle n'est spécifié, on laisse passer
            if (empty($roles)) {
                return $next($request);
            }

            // Vérifier si l'utilisateur a l'un des rôles requis
            if (!in_array($user->role, $roles, true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès refusé. Rôle insuffisant.'
                ], 403);
            }

            // Ajouter l'utilisateur à la requête pour un accès ultérieur
            $request->merge(['user' => $user]);
            
            return $next($request);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur d\'authentification',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
