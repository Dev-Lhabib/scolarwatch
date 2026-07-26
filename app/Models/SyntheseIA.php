<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SyntheseIA extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'syntheses_ia';

    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'id_synthese';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'trimestre',
        'statut',
        'niveau_alerte',
        'niveau_alerte_corrige',
        'facteurs_risque',
        'signaux_textuels',
        'recommandations',
        'message_parent',
        'genere_le',
        'id_eleve',
        'id_utilisateur_demandeur',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'facteurs_risque' => 'array',
            'signaux_textuels' => 'array',
            'recommandations' => 'array',
            'genere_le' => 'datetime',
        ];
    }

    /**
     * The eleve this synthese concerns.
     */
    public function eleve(): BelongsTo
    {
        return $this->belongsTo(Eleve::class, 'id_eleve', 'id_eleve');
    }

    /**
     * The user (professeur principal or direction) who requested this synthese.
     */
    public function demandeur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_utilisateur_demandeur', 'id');
    }
}
