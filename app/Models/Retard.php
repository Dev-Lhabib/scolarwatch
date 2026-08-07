<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Retard extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_retard';

    protected $fillable = [
        'date_retard',
        'justifiee',
        'minutes_retard',
        'motif',
        'id_eleve',
        'id_utilisateur',
    ];

    protected function casts(): array
    {
        return [
            'date_retard' => 'date',
            'justifiee' => 'boolean',
        ];
    }

    public function eleve(): BelongsTo
    {
        return $this->belongsTo(Eleve::class, 'id_eleve', 'id_eleve');
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_utilisateur', 'id');
    }
}
