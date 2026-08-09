<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEleveRequest;
use App\Models\Classe;
use App\Models\Eleve;
use Illuminate\Http\Request;

/**
 * Gestion des élèves et de leur archivage.
 *
 * @group Élèves
 */
class EleveController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @subgroup Gestion
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
     *      "updated_at": "2025-09-01T09:00:00.000000Z"
     *  }
     * ]
     */
    public function index()
    {
        $this->authorize('viewAny', Eleve::class);

        return response()->json(Eleve::all());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @subgroup Gestion
     *
     * @response status=201 {
     *  "id_eleve": 12,
     *  "nom": "Durand",
     *  "prenom": "Noah",
     *  "genre": "M",
     *  "date_naissance": "2013-07-21",
     *  "code_massar": "M987654321",
     *  "photo": null,
     *  "id_classe": 1,
     *  "created_at": "2025-09-02T10:00:00.000000Z",
     *  "updated_at": "2025-09-02T10:00:00.000000Z",
     *  "tuteurs": [
     *      {
     *          "id": 7,
     *          "nom": "Durand",
     *          "prenom": "Marie",
     *          "role": "parent",
     *          "is_active": true,
     *          "email": "marie.durand@scolarwatch.test"
     *      }
     *  ],
     *  "classe": {
     *      "id_classe": 1,
     *      "nom": "6ème A",
     *      "niveau": "6ème",
     *      "annee_scolaire": "2025-2026",
     *      "capacite": 30,
     *      "id_utilisateur_principal": 2
     *  }
     * }
     */
    public function store(StoreEleveRequest $request)
    {
        $this->authorize('create', Eleve::class);

        $validated = $request->validated();
        $tuteurIds = $validated['tuteur_ids'] ?? [];
        unset($validated['tuteur_ids']);

        $eleve = Eleve::create($validated);

        if (! empty($tuteurIds)) {
            $eleve->tuteurs()->attach($tuteurIds);
        }

        return response()->json($eleve->load('tuteurs', 'classe'), 201);
    }

    /**
     * Display the specified resource.
     *
     * @subgroup Gestion
     *
     * @urlParam eleve integer required L'ID de l'élève. Example: 10
     *
     * @response {
     *  "id_eleve": 10,
     *  "nom": "Bernard",
     *  "prenom": "Léa",
     *  "genre": "F",
     *  "date_naissance": "2014-03-12",
     *  "code_massar": "M123456789",
     *  "photo": null,
     *  "id_classe": 1,
     *  "created_at": "2025-09-01T09:00:00.000000Z",
     *  "updated_at": "2025-09-01T09:00:00.000000Z",
     *  "classe": {
     *      "id_classe": 1,
     *      "nom": "6ème A",
     *      "niveau": "6ème",
     *      "annee_scolaire": "2025-2026",
     *      "capacite": 30,
     *      "id_utilisateur_principal": 2
     *  },
     *  "tuteurs": [
     *      {
     *          "id": 6,
     *          "nom": "Bernard",
     *          "prenom": "Paul",
     *          "role": "parent",
     *          "is_active": true,
     *          "email": "paul.bernard@scolarwatch.test"
     *      }
     *  ]
     * }
     */
    public function show(Eleve $eleve)
    {
        $this->authorize('view', $eleve);

        return response()->json($eleve->load(['classe', 'tuteurs']));
    }

    /**
     * Update the specified resource in storage.
     *
     * @subgroup Gestion
     *
     * @urlParam eleve integer required L'ID de l'élève à modifier. Example: 10
     *
     * @response {
     *  "id_eleve": 10,
     *  "nom": "Bernard",
     *  "prenom": "Léa",
     *  "genre": "F",
     *  "date_naissance": "2014-03-12",
     *  "code_massar": "M123456789",
     *  "photo": null,
     *  "id_classe": 2,
     *  "created_at": "2025-09-01T09:00:00.000000Z",
     *  "updated_at": "2025-09-05T09:00:00.000000Z",
     *  "tuteurs": [
     *      {
     *          "id": 6,
     *          "nom": "Bernard",
     *          "prenom": "Paul",
     *          "role": "parent",
     *          "is_active": true,
     *          "email": "paul.bernard@scolarwatch.test"
     *      }
     *  ],
     *  "classe": {
     *      "id_classe": 2,
     *      "nom": "5ème A",
     *      "niveau": "5ème",
     *      "annee_scolaire": "2025-2026",
     *      "capacite": 30,
     *      "id_utilisateur_principal": null
     *  }
     * }
     */
    public function update(StoreEleveRequest $request, Eleve $eleve)
    {
        $this->authorize('update', $eleve);

        $validated = $request->validated();
        $tuteurIds = $validated['tuteur_ids'] ?? null;
        unset($validated['tuteur_ids']);

        $eleve->update($validated);

        if ($tuteurIds !== null) {
            $eleve->tuteurs()->sync($tuteurIds);
        }

        return response()->json($eleve->load('tuteurs', 'classe'));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @subgroup Gestion
     *
     * @urlParam eleve integer required L'ID de l'élève à supprimer. Example: 10
     *
     * @response status=204
     */
    public function destroy(Eleve $eleve)
    {
        $this->authorize('delete', $eleve);

        $eleve->delete();

        return response()->json(null, 204);
    }

    /**
     * Display a listing of soft-deleted (archived) eleves.
     *
     * @subgroup Archivage
     *
     * @response [
     *  {
     *      "id_eleve": 40,
     *      "nom": "Petit",
     *      "prenom": "Hugo",
     *      "genre": "M",
     *      "date_naissance": "2014-11-02",
     *      "code_massar": null,
     *      "photo": null,
     *      "id_classe": 1,
     *      "created_at": "2024-09-01T09:00:00.000000Z",
     *      "updated_at": "2025-07-05T09:00:00.000000Z",
     *      "deleted_at": "2025-07-05T09:00:00.000000Z"
     *  }
     * ]
     */
    public function archived()
    {
        $this->authorize('viewArchived', Eleve::class);

        return response()->json(Eleve::onlyTrashed()->get());
    }

    /**
     * Restore a soft-deleted (archived) eleve.
     *
     * @subgroup Archivage
     *
     * @urlParam eleve integer required L'ID de l'élève archivé. Example: 40
     *
     * @response {
     *  "id_eleve": 40,
     *  "nom": "Petit",
     *  "prenom": "Hugo",
     *  "genre": "M",
     *  "date_naissance": "2014-11-02",
     *  "code_massar": null,
     *  "photo": null,
     *  "id_classe": 1,
     *  "created_at": "2024-09-01T09:00:00.000000Z",
     *  "updated_at": "2025-07-05T09:00:00.000000Z",
     *  "deleted_at": null
     * }
     */
    public function restore(Eleve $eleve)
    {
        $this->authorize('restore', $eleve);

        $eleve->restore();

        return response()->json($eleve);
    }

    /**
     * Permanently delete a soft-deleted (archived) eleve.
     *
     * @subgroup Archivage
     *
     * @urlParam eleve integer required L'ID de l'élève archivé. Example: 40
     *
     * @response status=204
     */
    public function forceDelete(Eleve $eleve)
    {
        $this->authorize('forceDelete', $eleve);

        $eleve->forceDelete();

        return response()->json(null, 204);
    }

    /**
     * Archive (soft-delete) multiple eleves in one request.
     *
     * @subgroup Archivage
     *
     * @bodyParam ids integer[] required Les IDs des élèves à archiver. Example: [10,12]
     *
     * @response status=204
     */
    public function bulkArchive(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $eleves = Eleve::whereIn('id_eleve', $validated['ids'])->get();

        foreach ($eleves as $eleve) {
            $this->authorize('delete', $eleve);
        }

        $eleves->each->delete();

        return response()->json(null, 204);
    }

    /**
     * Restore multiple archived eleves in one request.
     *
     * @subgroup Archivage
     *
     * @bodyParam ids integer[] required Les IDs des élèves archivés à restaurer. Example: [10,12]
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
     *      "updated_at": "2025-09-05T09:00:00.000000Z",
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

        $eleves = Eleve::onlyTrashed()->whereIn('id_eleve', $validated['ids'])->get();

        foreach ($eleves as $eleve) {
            $this->authorize('restore', $eleve);
        }

        $eleves->each->restore();

        return response()->json($eleves);
    }

    /**
     * Permanently delete multiple archived eleves in one request.
     *
     * @subgroup Archivage
     *
     * @bodyParam ids integer[] required Les IDs des élèves archivés à supprimer définitivement. Example: [10,12]
     *
     * @response status=204
     */
    public function bulkForceDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $eleves = Eleve::onlyTrashed()->whereIn('id_eleve', $validated['ids'])->get();

        foreach ($eleves as $eleve) {
            $this->authorize('forceDelete', $eleve);
        }

        $eleves->each->forceDelete();

        return response()->json(null, 204);
    }

    /**
     * Assign multiple eleves to one existing (active) classe by updating only their id_classe.
     *
     * @subgroup Gestion
     *
     * @bodyParam ids integer[] required Les IDs des élèves à affecter. Example: [10,12]
     * @bodyParam id_classe integer required L'ID de la classe de destination. Example: 2
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
     *      "id_classe": 2,
     *      "created_at": "2025-09-01T09:00:00.000000Z",
     *      "updated_at": "2025-09-05T09:00:00.000000Z"
     *  }
     * ]
     */
    public function bulkAssignClass(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
            'id_classe' => ['required', 'integer', 'exists:classes,id_classe'],
        ]);

        $classe = Classe::findOrFail($validated['id_classe']);

        $eleves = Eleve::whereIn('id_eleve', $validated['ids'])->get();

        foreach ($eleves as $eleve) {
            $this->authorize('update', $eleve);
        }

        $eleves->each->update(['id_classe' => $classe->id_classe]);

        return response()->json($eleves);
    }
}
