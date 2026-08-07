<?php

namespace App\Policies;

use App\Models\Classe;
use App\Models\User;

class ClassePolicy
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
    public function view(User $user, Classe $classe): bool
    {
        if (in_array($user->role, ['admin', 'direction'])) {
            return true;
        }

        return $user->id === $classe->id_utilisateur_principal;
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
    public function update(User $user, Classe $classe): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Classe $classe): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can view the archived classes (admin archive feature).
     */
    public function viewArchived(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can restore a soft-deleted model.
     */
    public function restore(User $user, Classe $classe): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Classe $classe): bool
    {
        return $user->role === 'admin';
    }
}
