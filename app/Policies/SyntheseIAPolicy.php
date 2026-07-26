<?php

namespace App\Policies;

use App\Models\Eleve;
use App\Models\SyntheseIA;
use App\Models\User;

class SyntheseIAPolicy
{
    /**
     * Determine whether the user can trigger a synthese for the given eleve.
     * Reserved to the professeur principal of the eleve's classe, or direction/admin.
     */
    public function creerPour(User $user, Eleve $eleve): bool
    {
        if (in_array($user->role, ['admin', 'direction'])) {
            return true;
        }

        return $user->role === 'enseignant'
            && $user->id === $eleve->classe->id_utilisateur_principal;
    }

    /**
     * Determine whether the user can view a synthese.
     */
    public function view(User $user, SyntheseIA $synthese): bool
    {
        if (in_array($user->role, ['admin', 'direction'])) {
            return true;
        }

        if ($user->role === 'enseignant') {
            return $user->id === $synthese->eleve->classe->id_utilisateur_principal;
        }

        return false;
    }

    /**
     * Determine whether the user can correct the niveau_alerte.
     * Reserved to the professeur principal (matches view() logic for enseignant).
     */
    public function corriger(User $user, SyntheseIA $synthese): bool
    {
        return $this->view($user, $synthese);
    }
}
