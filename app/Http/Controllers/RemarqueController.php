<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRemarqueRequest;
use App\Models\Remarque;

/**
 * Gestion des remarques.
 *
 * @group Remarques
 */
class RemarqueController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * Les enseignants ne voient que les remarques qu'ils ont eux-mêmes saisies.
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
     *      "updated_at": "2025-10-15T09:00:00.000000Z"
     *  }
     * ]
     */
    public function index()
    {
        $this->authorize('viewAny', Remarque::class);

        $query = Remarque::query();

        if (auth()->user()->role === 'enseignant') {
            $query->where('id_utilisateur', auth()->id());
        }

        return response()->json($query->get());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @response status=201 {
     *  "id_remarque": 41,
     *  "contenu": "Travail à revoir avant la fin du trimestre.",
     *  "categorie": "attention",
     *  "trimestre": "T1",
     *  "date_remarque": "2025-10-16",
     *  "id_eleve": 12,
     *  "id_utilisateur": 2,
     *  "created_at": "2025-10-16T09:00:00.000000Z",
     *  "updated_at": "2025-10-16T09:00:00.000000Z"
     * }
     */
    public function store(StoreRemarqueRequest $request)
    {
        $validated = $request->validated();

        $this->authorize('create', [Remarque::class, (int) $validated['id_eleve']]);

        $validated['id_utilisateur'] = auth()->id();

        $remarque = Remarque::create($validated);

        return response()->json($remarque, 201);
    }

    /**
     * Display the specified resource.
     *
     * @urlParam remarque integer required L'ID de la remarque. Example: 40
     *
     * @response {
     *  "id_remarque": 40,
     *  "contenu": "Très bonne participation en classe.",
     *  "categorie": "positif",
     *  "trimestre": "T1",
     *  "date_remarque": "2025-10-15",
     *  "id_eleve": 10,
     *  "id_utilisateur": 2,
     *  "created_at": "2025-10-15T09:00:00.000000Z",
     *  "updated_at": "2025-10-15T09:00:00.000000Z",
     *  "eleve": {
     *      "id_eleve": 10,
     *      "nom": "Bernard",
     *      "prenom": "Léa",
     *      "genre": "F",
     *      "date_naissance": "2014-03-12",
     *      "code_massar": "M123456789",
     *      "photo": null,
     *      "id_classe": 1
     *  }
     * }
     */
    public function show(Remarque $remarque)
    {
        $this->authorize('view', $remarque);

        return response()->json($remarque->load('eleve'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @urlParam remarque integer required L'ID de la remarque à modifier. Example: 40
     *
     * @response {
     *  "id_remarque": 40,
     *  "contenu": "Excellente progression sur le trimestre.",
     *  "categorie": "positif",
     *  "trimestre": "T1",
     *  "date_remarque": "2025-10-15",
     *  "id_eleve": 10,
     *  "id_utilisateur": 2,
     *  "created_at": "2025-10-15T09:00:00.000000Z",
     *  "updated_at": "2025-10-20T09:00:00.000000Z"
     * }
     */
    public function update(StoreRemarqueRequest $request, Remarque $remarque)
    {
        $this->authorize('update', $remarque);

        $remarque->update($request->validated());

        return response()->json($remarque);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @urlParam remarque integer required L'ID de la remarque à supprimer. Example: 40
     *
     * @response status=204
     */
    public function destroy(Remarque $remarque)
    {
        $this->authorize('delete', $remarque);

        $remarque->delete();

        return response()->json(null, 204);
    }
}
