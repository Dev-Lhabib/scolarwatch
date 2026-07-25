<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Classe extends Model
{
    use HasFactory;

    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'id_classe';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'nom',
        'niveau',
        'annee_scolaire',
        'capacite',
        'id_utilisateur_principal',
    ];

    /**
     * The user (enseignant) designated as professeur principal of this classe.
     */
    public function professeurPrincipal(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_utilisateur_principal', 'id');
    }

    /**
     * The eleves belonging to this classe.
     */
    public function eleves(): HasMany
    {
        return $this->hasMany(Eleve::class, 'id_classe', 'id_classe');
    }

    /**
     * The enseignants assigned to teach in this classe, via enseigne.
     */
    public function enseignants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'enseigne', 'id_classe', 'id_utilisateur');
    }
}
