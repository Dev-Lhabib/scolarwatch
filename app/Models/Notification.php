<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'id_notification';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'titre',
        'message',
        'statut_envoi',
        'envoye_le',
        'lu',
        'id_utilisateur_destinataire',
        'id_synthese',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'envoye_le' => 'datetime',
            'lu' => 'boolean',
        ];
    }

    /**
     * The user (parent) this notification was sent to.
     */
    public function destinataire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_utilisateur_destinataire', 'id');
    }

    /**
     * The synthese IA this notification stems from, if any.
     */
    public function synthese(): BelongsTo
    {
        return $this->belongsTo(SyntheseIA::class, 'id_synthese', 'id_synthese');
    }
}
