<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClasseRequest;
use App\Http\Requests\UpdateClasseRequest;
use App\Models\Classe;
use Illuminate\Http\Request;

/**
 * Gestion des classes et de leur archivage.
 *
 * @group Classes
 */
class ClasseController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @subgroup Gestion
     *
     * @response [
     *  {
     *      "id_classe": 1,
     *      "nom": "6ème A",
     *      "niveau": "6ème",
     *      "annee_scolaire": "2025-2026",
     *      "capacite": 30,
     *      "id_utilisateur_principal": 2,
     *      "created_at": "2025-09-01T09:00:00.000000Z",
     *      "updated_at": "2025-09-01T09:00:00.000000Z",
     *      "professeur_principal": {
     *          "id": 2,
     *          "nom": "Doe",
     *          "prenom": "Jean",
     *          "username": "jdoe",
     *          "telephone": "0661234567",
     *          "adresse": null,
     *          "role": "enseignant",
     *          "is_active": true,
     *          "id_matiere": 1,
     *          "email": "jean.doe@scolarwatch.test",
     *          "created_at": "2025-09-01T09:00:00.000000Z",
     *          "updated_at": "2025-09-01T09:00:00.000000Z",
     *          "is_bootstrap_admin": false
     *      },
     *      "enseignants": []
     *  }
     * ]
     */
    public function index()
    {
        $this->authorize('viewAny', Classe::class);

        return response()->json(Classe::with('professeurPrincipal', 'enseignants')->get());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @subgroup Gestion
     *
     * @response status=201 {
     *  "id_classe": 4,
     *  "nom": "5ème B",
     *  "niveau": "5ème",
     *  "annee_scolaire": "2025-2026",
     *  "capacite": 28,
     *  "id_utilisateur_principal": null,
     *  "created_at": "2025-09-01T10:00:00.000000Z",
     *  "updated_at": "2025-09-01T10:00:00.000000Z"
     * }
     */
    public function store(StoreClasseRequest $request)
    {
        $this->authorize('create', Classe::class);

        $classe = Classe::create($request->validated());

        return response()->json($classe, 201);
    }

    /**
     * Display the specified resource.
     *
     * @subgroup Gestion
     *
     * @urlParam classe integer required L'ID de la classe. Example: 1
     *
     * @response {
     *  "id_classe": 1,
     *  "nom": "6ème A",
     *  "niveau": "6ème",
     *  "annee_scolaire": "2025-2026",
     *  "capacite": 30,
     *  "id_utilisateur_principal": 2,
     *  "created_at": "2025-09-01T09:00:00.000000Z",
     *  "updated_at": "2025-09-01T09:00:00.000000Z",
     *  "professeur_principal": {
     *      "id": 2,
     *      "nom": "Doe",
     *      "prenom": "Jean",
     *      "role": "enseignant",
     *      "is_active": true,
     *      "id_matiere": 1,
     *      "email": "jean.doe@scolarwatch.test"
     *  },
     *  "enseignants": [
     *      {
     *          "id": 3,
     *          "nom": "Smith",
     *          "prenom": "Alice",
     *          "role": "enseignant",
     *          "is_active": true,
     *          "id_matiere": 2,
     *          "email": "alice.smith@scolarwatch.test"
     *      }
     *  ],
     *  "eleves": [
     *      {
     *          "id_eleve": 10,
     *          "nom": "Bernard",
     *          "prenom": "Léa",
     *          "genre": "F",
     *          "date_naissance": "2014-03-12",
     *          "code_massar": "M123456789",
     *          "photo": null,
     *          "id_classe": 1,
     *          "created_at": "2025-09-01T09:00:00.000000Z",
     *          "updated_at": "2025-09-01T09:00:00.000000Z"
     *      }
     *  ]
     * }
     */
    public function show(Classe $classe)
    {
        $this->authorize('view', $classe);

        return response()->json($classe->load(['professeurPrincipal', 'enseignants', 'eleves']));
    }

    /**
     * Update the specified resource in storage.
     *
     * @subgroup Gestion
     *
     * @urlParam classe integer required L'ID de la classe à modifier. Example: 1
     *
     * @response {
     *  "id_classe": 1,
     *  "nom": "6ème A",
     *  "niveau": "6ème",
     *  "annee_scolaire": "2025-2026",
     *  "capacite": 32,
     *  "id_utilisateur_principal": 2,
     *  "created_at": "2025-09-01T09:00:00.000000Z",
     *  "updated_at": "2025-09-03T09:00:00.000000Z"
     * }
     */
    public function update(UpdateClasseRequest $request, Classe $classe)
    {
        $this->authorize('update', $classe);

        $classe->update($request->validated());

        return response()->json($classe);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @subgroup Gestion
     *
     * @urlParam classe integer required L'ID de la classe à supprimer. Example: 1
     *
     * @response status=204
     */
    public function destroy(Classe $classe)
    {
        $this->authorize('delete', $classe);

        $classe->delete();

        return response()->json(null, 204);
    }

    /**
     * Display a listing of soft-deleted (archived) classes.
     *
     * @subgroup Archivage
     *
     * @response [
     *  {
     *      "id_classe": 9,
     *      "nom": "3ème C",
     *      "niveau": "3ème",
     *      "annee_scolaire": "2024-2025",
     *      "capacite": 25,
     *      "id_utilisateur_principal": null,
     *      "created_at": "2024-09-01T09:00:00.000000Z",
     *      "updated_at": "2025-07-05T09:00:00.000000Z",
     *      "deleted_at": "2025-07-05T09:00:00.000000Z"
     *  }
     * ]
     */
    public function archived()
    {
        $this->authorize('viewArchived', Classe::class);

        return response()->json(Classe::onlyTrashed()->get());
    }

    /**
     * Restore a soft-deleted (archived) classe.
     *
     * @subgroup Archivage
     *
     * @urlParam classe integer required L'ID de la classe archivée. Example: 9
     *
     * @response {
     *  "id_classe": 9,
     *  "nom": "3ème C",
     *  "niveau": "3ème",
     *  "annee_scolaire": "2024-2025",
     *  "capacite": 25,
     *  "id_utilisateur_principal": null,
     *  "created_at": "2024-09-01T09:00:00.000000Z",
     *  "updated_at": "2025-07-05T09:00:00.000000Z",
     *  "deleted_at": null
     * }
     */
    public function restore(Classe $classe)
    {
        $this->authorize('restore', $classe);

        $classe->restore();

        return response()->json($classe);
    }

    /**
     * Permanently delete a soft-deleted (archived) classe.
     *
     * @subgroup Archivage
     *
     * @urlParam classe integer required L'ID de la classe archivée. Example: 9
     *
     * @response status=204
     */
    public function forceDelete(Classe $classe)
    {
        $this->authorize('forceDelete', $classe);

        $classe->forceDelete();

        return response()->json(null, 204);
    }

    /**
     * Archive (soft-delete) multiple classes in one request.
     *
     * @subgroup Archivage
     *
     * @bodyParam ids integer[] required Les IDs des classes à archiver. Example: [1,2]
     *
     * @response status=204
     */
    public function bulkArchive(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $classes = Classe::whereIn('id_classe', $validated['ids'])->get();

        foreach ($classes as $classe) {
            $this->authorize('delete', $classe);
        }

        $classes->each->delete();

        return response()->json(null, 204);
    }

    /**
     * Restore multiple archived classes in one request.
     *
     * @subgroup Archivage
     *
     * @bodyParam ids integer[] required Les IDs des classes archivées à restaurer. Example: [1,2]
     *
     * @response [
     *  {
     *      "id_classe": 1,
     *      "nom": "6ème A",
     *      "niveau": "6ème",
     *      "annee_scolaire": "2025-2026",
     *      "capacite": 30,
     *      "id_utilisateur_principal": 2,
     *      "created_at": "2025-09-01T09:00:00.000000Z",
     *      "updated_at": "2025-09-03T09:00:00.000000Z",
     *      "deleted_at": null
     *  }
     * ]
     */
    public function bulkRestore(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $classes = Classe::onlyTrashed()->whereIn('id_classe', $validated['ids'])->get();

        foreach ($classes as $classe) {
            $this->authorize('restore', $classe);
        }

        $classes->each->restore();

        return response()->json($classes);
    }

    /**
     * Permanently delete multiple archived classes in one request.
     *
     * @subgroup Archivage
     *
     * @bodyParam ids integer[] required Les IDs des classes archivées à supprimer définitivement. Example: [1,2]
     *
     * @response status=204
     */
    public function bulkForceDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $classes = Classe::onlyTrashed()->whereIn('id_classe', $validated['ids'])->get();

        foreach ($classes as $classe) {
            $this->authorize('forceDelete', $classe);
        }

        $classes->each->forceDelete();

        return response()->json(null, 204);
    }

    /**
     * Designate the professeur principal for this classe.
     *
     * @subgroup Gestion
     *
     * @urlParam classe integer required L'ID de la classe. Example: 1
     *
     * @bodyParam id_utilisateur_principal integer required L'ID de l'utilisateur (enseignant) à désigner. Example: 2
     *
     * @response {
     *  "id_classe": 1,
     *  "nom": "6ème A",
     *  "niveau": "6ème",
     *  "annee_scolaire": "2025-2026",
     *  "capacite": 30,
     *  "id_utilisateur_principal": 2,
     *  "created_at": "2025-09-01T09:00:00.000000Z",
     *  "updated_at": "2025-09-04T09:00:00.000000Z",
     *  "professeur_principal": {
     *      "id": 2,
     *      "nom": "Doe",
     *      "prenom": "Jean",
     *      "role": "enseignant",
     *      "is_active": true,
     *      "id_matiere": 1,
     *      "email": "jean.doe@scolarwatch.test"
     *  }
     * }
     */
    public function assignProfesseurPrincipal(Request $request, Classe $classe)
    {
        $this->authorize('update', $classe);

        $validated = $request->validate([
            'id_utilisateur_principal' => ['required', 'exists:users,id'],
        ]);

        $classe->update(['id_utilisateur_principal' => $validated['id_utilisateur_principal']]);

        return response()->json($classe->load('professeurPrincipal'));
    }

    /**
     * Assign an enseignant to teach in this classe.
     *
     * L'enseignant est ajouté sans retirer les affectations existantes.
     *
     * @subgroup Gestion
     *
     * @urlParam classe integer required L'ID de la classe. Example: 1
     *
     * @bodyParam id_utilisateur integer required L'ID de l'utilisateur (enseignant) à affecter. Example: 3
     *
     * @response {
     *  "id_classe": 1,
     *  "nom": "6ème A",
     *  "niveau": "6ème",
     *  "annee_scolaire": "2025-2026",
     *  "capacite": 30,
     *  "id_utilisateur_principal": 2,
     *  "created_at": "2025-09-01T09:00:00.000000Z",
     *  "updated_at": "2025-09-01T09:00:00.000000Z",
     *  "enseignants": [
     *      {
     *          "id": 3,
     *          "nom": "Smith",
     *          "prenom": "Alice",
     *          "role": "enseignant",
     *          "is_active": true,
     *          "id_matiere": 2,
     *          "email": "alice.smith@scolarwatch.test"
     *      }
     *  ]
     * }
     */
    public function assignEnseignant(Request $request, Classe $classe)
    {
        $this->authorize('update', $classe);

        $validated = $request->validate([
            'id_utilisateur' => ['required', 'exists:users,id'],
        ]);

        $classe->enseignants()->syncWithoutDetaching([$validated['id_utilisateur']]);

        return response()->json($classe->load('enseignants'));
    }
}
