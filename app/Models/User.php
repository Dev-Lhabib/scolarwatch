<?php

namespace App\Models;

use App\Models\Concerns\HasAuditFields;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $nom
 * @property string $prenom
 * @property string $username
 * @property string|null $telephone
 * @property string|null $adresse
 * @property string $role
 * @property bool $is_active
 * @property int|null $id_matiere
 * @property int|null $cree_par
 * @property int|null $updated_by
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['nom', 'prenom', 'username', 'email', 'password', 'telephone', 'adresse', 'role', 'is_active', 'id_matiere'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasAuditFields, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * The matiere this user (enseignant) is fixed to teach.
     */
    public function matiere(): BelongsTo
    {
        return $this->belongsTo(Matiere::class, 'id_matiere', 'id_matiere');
    }

    /**
     * The eleves this user is a tuteur of.
     */
    public function eleves(): BelongsToMany
    {
        return $this->belongsToMany(Eleve::class, 'est_tuteur_de', 'id_utilisateur', 'id_eleve');
    }

    /**
     * The classes this user (enseignant) is assigned to teach in, via enseigne.
     */
    public function classesEnseignees(): BelongsToMany
    {
        return $this->belongsToMany(Classe::class, 'enseigne', 'id_utilisateur', 'id_classe');
    }

    /**
     * The notifications received by this user (typically a parent).
     */
    public function notificationsRecues(): HasMany
    {
        return $this->hasMany(Notification::class, 'id_utilisateur_destinataire', 'id');
    }
}
