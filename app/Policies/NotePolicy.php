<?php

namespace App\Policies;

use App\Models\Note;
use App\Models\User;

class NotePolicy
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
    public function view(User $user, Note $note): bool
    {
        if (in_array($user->role, ['admin', 'direction'])) {
            return true;
        }

        if ($user->role === 'enseignant') {
            return $this->enseigneClasseEtMatiere($user, $note->id_eleve, $note->id_matiere);
        }

        if ($user->role === 'parent') {
            return $note->eleve->tuteurs()->where('users.id', $user->id)->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     * The eleve and matiere must be provided in the request for this check to run
     * against the correct classe/matiere pair (see StoreNoteRequest / controller).
     */
    public function create(User $user, ?int $idEleve = null, ?int $idMatiere = null): bool
    {
        if (in_array($user->role, ['admin', 'direction'])) {
            return true;
        }

        if ($user->role === 'enseignant' && $idEleve && $idMatiere) {
            return $this->enseigneClasseEtMatiere($user, $idEleve, $idMatiere);
        }

        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Note $note): bool
    {
        if (in_array($user->role, ['admin', 'direction'])) {
            return true;
        }

        if ($user->role === 'enseignant') {
            return $this->enseigneClasseEtMatiere($user, $note->id_eleve, $note->id_matiere);
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Note $note): bool
    {
        return $this->update($user, $note);
    }

    /**
     * Core check: the enseignant must (1) be assigned to the eleve's classe via `enseigne`,
     * AND (2) their fixed id_matiere must match the matiere in question.
     */
    private function enseigneClasseEtMatiere(User $user, int $idEleve, int $idMatiere): bool
    {
        if ($user->id_matiere !== $idMatiere) {
            return false;
        }

        $eleve = \App\Models\Eleve::find($idEleve);

        if (! $eleve) {
            return false;
        }

        return $user->classesEnseignees()->where('classes.id_classe', $eleve->id_classe)->exists();
    }
}
