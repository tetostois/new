<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Alias de middlewares pour JWT (équivalent Kernel::$routeMiddleware)
        $middleware->alias([
            'jwt.auth' => Tymon\JWTAuth\Http\Middleware\Authenticate::class,
            'jwt.refresh' => Tymon\JWTAuth\Http\Middleware\RefreshToken::class,
            'role' => App\Http\Middleware\EnsureUserRole::class,
        ]);

        // Pour les API: ne pas rediriger vers une route 'login' inexistante
        // Renvoyer 401 JSON au lieu d'une redirection
        if (method_exists($middleware, 'redirectGuestsTo')) {
            $middleware->redirectGuestsTo(fn () => null);
        }
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Gérer les erreurs d'authentification pour les API
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non authentifié. Veuillez vous connecter.'
                ], 401);
            }
        });
    })->create();
