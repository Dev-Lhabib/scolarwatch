<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absence extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'id_absence';

    protected $fillable = [
        'date_absence',
        'justifiee',
        'motif',
        'id_eleve',
        'id_utilisateur',
    ];

    protected function casts(): array
    {
        return [
            'date_absence' => 'date',
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
