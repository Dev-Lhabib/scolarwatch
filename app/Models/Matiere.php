<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Matiere extends Model
{
    use HasFactory;

    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'id_matiere';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'nom',
        'code',
    ];

    /**
     * The enseignants (users) whose fixed subject is this matiere.
     */
    public function enseignants(): HasMany
    {
        return $this->hasMany(User::class, 'id_matiere', 'id_matiere');
    }
}
