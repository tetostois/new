<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Activity extends Model
{
    protected $fillable = [
        'type',
        'description',
        'data',
        'user_id',
    ];

    protected $casts = [
        'data' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Relation avec l'utilisateur concerné par l'activité
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Enregistrer une nouvelle activité
     */
    public static function log(string $type, string $description, ?User $user = null, ?array $data = null): self
    {
        return self::create([
            'type' => $type,
            'description' => $description,
            'user_id' => $user?->id,
            'data' => $data,
        ]);
    }

    /**
     * Obtenir les activités récentes
     */
    public static function getRecent(int $limit = 10)
    {
        return self::with('user')
            ->latest()
            ->limit($limit)
            ->get();
    }
}
