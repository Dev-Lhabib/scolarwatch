<?php

namespace App\Policies;

use App\Models\Retard;
use App\Models\User;

class RetardPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'direction', 'enseignant']);
    }

    public function view(User $user, Retard $retard): bool
    {
        if (in_array($user->role, ['admin', 'direction'])) {
            return true;
        }

        if ($user->role === 'enseignant') {
            return $this->enseigneClasse($user, $retard->id_eleve);
        }

        if ($user->role === 'parent') {
            return $retard->eleve->tuteurs()->where('users.id', $user->id)->exists();
        }

        return false;
    }

    public function create(User $user, ?int $idEleve = null): bool
    {
        if (in_array($user->role, ['admin', 'direction'])) {
            return true;
        }

        if ($user->role === 'enseignant' && $idEleve) {
            return $this->enseigneClasse($user, $idEleve);
        }

        return false;
    }

    public function update(User $user, Retard $retard): bool
    {
        if (in_array($user->role, ['admin', 'direction'])) {
            return true;
        }

        if ($user->role === 'enseignant') {
            return $this->enseigneClasse($user, $retard->id_eleve);
        }

        return false;
    }

    public function delete(User $user, Retard $retard): bool
    {
        return $this->update($user, $retard);
    }

    private function enseigneClasse(User $user, int $idEleve): bool
    {
        $eleve = \App\Models\Eleve::find($idEleve);

        if (! $eleve) {
            return false;
        }

        if ($user->id === $eleve->classe->id_utilisateur_principal) {
            return true;
        }

        return $user->classesEnseignees()->where('classes.id_classe', $eleve->id_classe)->exists();
    }
}
