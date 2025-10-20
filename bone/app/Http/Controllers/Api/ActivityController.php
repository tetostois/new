<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    /**
     * Récupère les activités récentes
     */
    public function recent(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 5);
        
        $activities = Activity::with('user')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'type' => $activity->type,
                    'description' => $activity->description,
                    'user' => $activity->user ? [
                        'id' => $activity->user->id,
                        'name' => $activity->user->first_name . ' ' . $activity->user->last_name,
                        'email' => $activity->user->email,
                    ] : null,
                    'data' => $activity->data,
                    'created_at' => $activity->created_at->diffForHumans(),
                    'timestamp' => $activity->created_at->toDateTimeString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $activities,
        ]);
    }
}
