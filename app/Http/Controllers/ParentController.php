<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\Eleve;
use App\Models\Note;
use App\Models\Remarque;
use App\Models\Retard;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Espace parent : données scolaires des enfants de l'utilisateur connecté.
 *
 * Tous ces endpoints ne retournent que les données des élèves dont
 * l'utilisateur connecté est tuteur.
 *
 * @group Espace parent
 */
class ParentController extends Controller
{
    /**
     * The eleves for which the authenticated user is a tuteur, with their classe.
     * Scoped to the authenticated parent only.
     *
     * @response [
     *  {
     *      "id_eleve": 10,
     *      "nom": "Bernard",
     *      "prenom": "Léa",
     *      "genre": "F",
     *      "date_naissance": "2014-03-12",
     *      "code_massar": "M123456789",
     *      "photo": null,
     *      "id_classe": 1,
     *      "created_at": "2025-09-01T09:00:00.000000Z",
     *      "updated_at": "2025-09-01T09:00:00.000000Z",
     *      "classe": {
     *          "id_classe": 1,
     *          "nom": "6ème A",
     *          "niveau": "6ème",
     *          "annee_scolaire": "2025-2026",
     *          "capacite": 30,
     *          "id_utilisateur_principal": 2
     *      }
     *  }
     * ]
     */
    public function children(): JsonResponse
    {
        return response()->json(
            auth()->user()->eleves()->with('classe')->get()
        );
    }

    /**
     * The notes of the authenticated parent's children.
     *
     * @queryParam id_eleve integer Facultatif. Restreint aux notes d'un seul enfant. Example: 10
     *
     * @response [
     *  {
     *      "id_note": 55,
     *      "valeur": "15.50",
     *      "trimestre": "T1",
     *      "date": "2025-10-06",
     *      "id_eleve": 10,
     *      "id_matiere": 1,
     *      "id_utilisateur": 2,
     *      "created_at": "2025-10-06T09:00:00.000000Z",
     *      "updated_at": "2025-10-06T09:00:00.000000Z",
     *      "matiere": {
     *          "id_matiere": 1,
     *          "nom": "Mathématiques",
     *          "code": "MATH"
     *      },
     *      "utilisateur": {
     *          "id": 2,
     *          "nom": "Doe",
     *          "prenom": "Jean",
     *          "role": "enseignant",
     *          "is_active": true,
     *          "email": "jean.doe@scolarwatch.test"
     *      }
     *  }
     * ]
     */
    public function notes(Request $request): JsonResponse
    {
        return response()->json(
            $this->recordsForChildren(Note::query(), 'date', $request)
                ->with(['matiere', 'utilisateur'])
                ->get()
        );
    }

    /**
     * The absences of the authenticated parent's children.
     *
     * @queryParam id_eleve integer Facultatif. Restreint aux absences d'un seul enfant. Example: 10
     *
     * @response [
     *  {
     *      "id_absence": 30,
     *      "date_absence": "2025-10-13",
     *      "justifiee": true,
     *      "motif": "Rendez-vous médical",
     *      "id_eleve": 10,
     *      "id_utilisateur": 2,
     *      "created_at": "2025-10-13T09:00:00.000000Z",
     *      "updated_at": "2025-10-13T09:00:00.000000Z",
     *      "utilisateur": {
     *          "id": 2,
     *          "nom": "Doe",
     *          "prenom": "Jean",
     *          "role": "enseignant",
     *          "is_active": true,
     *          "email": "jean.doe@scolarwatch.test"
     *      }
     *  }
     * ]
     */
    public function absences(Request $request): JsonResponse
    {
        return response()->json(
            $this->recordsForChildren(Absence::query(), 'date_absence', $request)
                ->with('utilisateur')
                ->get()
        );
    }

    /**
     * The retards of the authenticated parent's children.
     *
     * @queryParam id_eleve integer Facultatif. Restreint aux retards d'un seul enfant. Example: 10
     *
     * @response [
     *  {
     *      "id_retard": 20,
     *      "date_retard": "2025-10-20",
     *      "justifiee": false,
     *      "minutes_retard": 15,
     *      "motif": null,
     *      "id_eleve": 10,
     *      "id_utilisateur": 2,
     *      "created_at": "2025-10-20T08:15:00.000000Z",
     *      "updated_at": "2025-10-20T08:15:00.000000Z",
     *      "utilisateur": {
     *          "id": 2,
     *          "nom": "Doe",
     *          "prenom": "Jean",
     *          "role": "enseignant",
     *          "is_active": true,
     *          "email": "jean.doe@scolarwatch.test"
     *      }
     *  }
     * ]
     */
    public function retards(Request $request): JsonResponse
    {
        return response()->json(
            $this->recordsForChildren(Retard::query(), 'date_retard', $request)
                ->with('utilisateur')
                ->get()
        );
    }

    /**
     * The remarques of the authenticated parent's children.
     *
     * @queryParam id_eleve integer Facultatif. Restreint aux remarques d'un seul enfant. Example: 10
     *
     * @response [
     *  {
     *      "id_remarque": 40,
     *      "contenu": "Très bonne participation en classe.",
     *      "categorie": "positif",
     *      "trimestre": "T1",
     *      "date_remarque": "2025-10-15",
     *      "id_eleve": 10,
     *      "id_utilisateur": 2,
     *      "created_at": "2025-10-15T09:00:00.000000Z",
     *      "updated_at": "2025-10-15T09:00:00.000000Z",
     *      "utilisateur": {
     *          "id": 2,
     *          "nom": "Doe",
     *          "prenom": "Jean",
     *          "role": "enseignant",
     *          "is_active": true,
     *          "email": "jean.doe@scolarwatch.test"
     *      }
     *  }
     * ]
     */
    public function remarques(Request $request): JsonResponse
    {
        return response()->json(
            $this->recordsForChildren(Remarque::query(), 'date_remarque', $request)
                ->with('utilisateur')
                ->get()
        );
    }

    /**
     * Scope a record query to the authenticated parent's own children, optionally
     * restricted to a single child via the id_eleve query parameter. Any id_eleve
     * outside the parent's perimeter is rejected with a 403.
     *
     * @template T of \Illuminate\Database\Eloquent\Model
     *
     * @param  Builder<T>  $query
     * @return Builder<T>
     */
    private function recordsForChildren($query, string $dateColumn, Request $request)
    {
        $query->whereIn('id_eleve', $this->childIds())->latest($dateColumn);

        if ($request->filled('id_eleve')) {
            $idEleve = $request->integer('id_eleve');
            $eleve = Eleve::find($idEleve);

            abort_unless($eleve !== null, 403);

            $this->authorize('view', $eleve);

            $query->where('id_eleve', $idEleve);
        }

        return $query;
    }

    /**
     * The ids of the eleves for which the authenticated user is a tuteur.
     *
     * @return array<int, int>
     */
    private function childIds(): array
    {
        return auth()->user()->eleves()->pluck('eleves.id_eleve')->all();
    }
}
