<?php

namespace App\Policies;

use App\Models\Eleve;
use App\Models\User;

class ElevePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'direction', 'enseignant']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Eleve $eleve): bool
    {
        if (in_array($user->role, ['admin', 'direction'])) {
            return true;
        }

        if ($user->role === 'enseignant') {
            return $user->id === $eleve->classe->id_utilisateur_principal;
        }

        if ($user->role === 'parent') {
            return $eleve->tuteurs()->where('users.id', $user->id)->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Eleve $eleve): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Eleve $eleve): bool
    {
        return $user->role === 'admin';
    }
}
