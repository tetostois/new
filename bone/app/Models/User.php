<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    /**
     * Relation avec les activités de l'utilisateur
     */
    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    /**
     * Les rôles disponibles pour les utilisateurs
     */
    const ROLE_ADMIN = 'admin';
    const ROLE_EXAMINER = 'examiner';
    const ROLE_CANDIDATE = 'candidate';

    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
        'role',
        'avatar',
        'address',
        'place_of_birth',
        'city',
        'country',
        'profession',
        'postal_code',
        'date_of_birth',
        'bio',
        'specialization',
        'qualifications',
        'experience_years',
        'is_active',
        'last_login_at',
        'email_verified_at',
        'settings',
    ];

    /**
     * Les attributs qui doivent être cachés pour la sérialisation.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Les attributs qui doivent être convertis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'date_of_birth' => 'date',
        'is_active' => 'boolean',
        'settings' => 'array',
        'last_login_at' => 'datetime',
    ];

    /**
     * Les valeurs par défaut des attributs du modèle.
     *
     * @var array
     */
    protected $attributes = [
        'is_active' => true,
        'settings' => '{"notifications": true, "theme": "light"}',
    ];

    /**
     * Obtenez l'identifiant qui sera stocké dans la revendication du sujet du JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Renvoie un tableau de valeurs clés, contenant toutes les revendications personnalisées à ajouter au JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
            'email' => $this->email,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
        ];
    }

    /**
     * Obtenez le nom complet de l'utilisateur.
     *
     * @return string
     */
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Vérifie si l'utilisateur a un rôle spécifique.
     *
     * @param string|array $roles
     * @return bool
     */
    public function hasRole($roles)
    {
        if (is_array($roles)) {
            return in_array($this->role, $roles);
        }
        
        return $this->role === $roles;
    }

    /**
     * Vérifie si l'utilisateur est administrateur.
     *
     * @return bool
     */
    public function isAdmin()
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Vérifie si l'utilisateur est un examinateur.
     *
     * @return bool
     */
    public function isExaminer()
    {
        return $this->role === self::ROLE_EXAMINER;
    }

    /**
     * Vérifie si l'utilisateur est un candidat.
     *
     * @return bool
     */
    public function isCandidate()
    {
        return $this->role === self::ROLE_CANDIDATE;
    }

    /**
     * Relation avec les examens créés (pour les administrateurs)
     */
    public function createdExams()
    {
        return $this->hasMany(Exam::class, 'created_by');
    }

    /**
     * Relation avec les soumissions d'examen (pour les candidats)
     */
    public function examSubmissions()
    {
        return $this->hasMany(ExamSubmission::class, 'candidate_id');
    }

    /**
     * Relation avec les soumissions à corriger (pour les examinateurs)
     */
    public function assignedSubmissions()
    {
        return $this->hasMany(ExamSubmission::class, 'examiner_id');
    }

    /**
     * Relation avec les notifications
     */
    public function notifications()
    {
        return $this->morphMany(Notification::class, 'notifiable')->latest();
    }

    /**
     * Relation avec les messages envoyés
     */
    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Relation avec les messages reçus
     */
    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'recipient_id');
    }

    /**
     * Relation avec les commentaires sur les soumissions
     */
    public function submissionComments()
    {
        return $this->hasMany(SubmissionComment::class);
    }

    /**
     * Relation avec les certificats obtenus
     */
    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }

    /**
     * Relation avec les paiements effectués
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Scope pour les utilisateurs actifs
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope pour les administrateurs
     */
    public function scopeAdmins($query)
    {
        return $query->where('role', self::ROLE_ADMIN);
    }

    /**
     * Scope pour les examinateurs
     */
    public function scopeExaminers($query)
    {
        return $query->where('role', self::ROLE_EXAMINER);
    }

    /**
     * Scope pour les candidats
     */
    public function scopeCandidates($query)
    {
        return $query->where('role', self::ROLE_CANDIDATE);
    }

    /**
     * Marquer l'utilisateur comme connecté
     */
    public function markAsLoggedIn()
    {
        $this->last_login_at = now();
        $this->save();
        
        return $this;
    }

    /**
     * Vérifier si l'utilisateur peut être supprimé
     */
    public function canBeDeleted()
    {
        // Empêcher la suppression si l'utilisateur a des relations importantes
        return !$this->createdExams()->exists() &&
               !$this->examSubmissions()->exists() &&
               !$this->assignedSubmissions()->exists() &&
               !$this->certificates()->exists();
    }
}