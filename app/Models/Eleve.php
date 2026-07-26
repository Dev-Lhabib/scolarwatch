<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Eleve extends Model
{
    use HasFactory;

    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'id_eleve';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'nom',
        'prenom',
        'genre',
        'date_naissance',
        'code_massar',
        'photo',
        'id_classe',
    ];

    /**
     * Casts.
     */
    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
        ];
    }

    /**
     * The classe this eleve belongs to.
     */
    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class, 'id_classe', 'id_classe');
    }

    /**
     * The tuteurs (parents) linked to this eleve, via est_tuteur_de.
     */
    public function tuteurs(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'est_tuteur_de', 'id_eleve', 'id_utilisateur');
    }

    /**
     * The notes recorded for this eleve.
     */
    public function notes(): HasMany
    {
        return $this->hasMany(Note::class, 'id_eleve', 'id_eleve');
    }

    /**
     * The absences recorded for this eleve.
     */
    public function absences(): HasMany
    {
        return $this->hasMany(Absence::class, 'id_eleve', 'id_eleve');
    }

    /**
     * The retards recorded for this eleve.
     */
    public function retards(): HasMany
    {
        return $this->hasMany(Retard::class, 'id_eleve', 'id_eleve');
    }

    /**
     * The remarques recorded for this eleve.
     */
    public function remarques(): HasMany
    {
        return $this->hasMany(Remarque::class, 'id_eleve', 'id_eleve');
    }

    /**
     * The syntheses IA generated for this eleve.
     */
    public function synthesesIA(): HasMany
    {
        return $this->hasMany(SyntheseIA::class, 'id_eleve', 'id_eleve');
    }
}
