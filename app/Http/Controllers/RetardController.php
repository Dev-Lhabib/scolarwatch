<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRetardRequest;
use App\Models\Retard;

/**
 * Gestion des retards.
 *
 * @group Retards
 */
class RetardController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * Les enseignants ne voient que les retards qu'ils ont eux-mêmes saisis.
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
     *      "updated_at": "2025-10-20T08:15:00.000000Z"
     *  }
     * ]
     */
    public function index()
    {
        $this->authorize('viewAny', Retard::class);

        $query = Retard::query();

        if (auth()->user()->role === 'enseignant') {
            $query->where('id_utilisateur', auth()->id());
        }

        return response()->json($query->get());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @response status=201 {
     *  "id_retard": 21,
     *  "date_retard": "2025-10-21",
     *  "justifiee": true,
     *  "minutes_retard": 5,
     *  "motif": "Transport en panne",
     *  "id_eleve": 12,
     *  "id_utilisateur": 2,
     *  "created_at": "2025-10-21T08:05:00.000000Z",
     *  "updated_at": "2025-10-21T08:05:00.000000Z"
     * }
     * @response status=422 scenario="Retard déjà déclaré ce jour" {
     *  "message": "Cet élève a déjà un retard à cette date.",
     *  "errors": {
     *      "date_retard": ["Cet élève a déjà un retard à cette date."]
     *  }
     * }
     */
    public function store(StoreRetardRequest $request)
    {
        $validated = $request->validated();

        $this->authorize('create', [Retard::class, (int) $validated['id_eleve']]);

        $validated['id_utilisateur'] = auth()->id();

        $retard = Retard::create($validated);

        return response()->json($retard, 201);
    }

    /**
     * Display the specified resource.
     *
     * @urlParam retard integer required L'ID du retard. Example: 20
     *
     * @response {
     *  "id_retard": 20,
     *  "date_retard": "2025-10-20",
     *  "justifiee": false,
     *  "minutes_retard": 15,
     *  "motif": null,
     *  "id_eleve": 10,
     *  "id_utilisateur": 2,
     *  "created_at": "2025-10-20T08:15:00.000000Z",
     *  "updated_at": "2025-10-20T08:15:00.000000Z",
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
    public function show(Retard $retard)
    {
        $this->authorize('view', $retard);

        return response()->json($retard->load('eleve'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @urlParam retard integer required L'ID du retard à modifier. Example: 20
     *
     * @response {
     *  "id_retard": 20,
     *  "date_retard": "2025-10-20",
     *  "justifiee": true,
     *  "minutes_retard": 10,
     *  "motif": "Certificat fourni",
     *  "id_eleve": 10,
     *  "id_utilisateur": 2,
     *  "created_at": "2025-10-20T08:15:00.000000Z",
     *  "updated_at": "2025-10-21T09:00:00.000000Z"
     * }
     */
    public function update(StoreRetardRequest $request, Retard $retard)
    {
        $this->authorize('update', $retard);

        $retard->update($request->validated());

        return response()->json($retard);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @urlParam retard integer required L'ID du retard à supprimer. Example: 20
     *
     * @response status=204
     */
    public function destroy(Retard $retard)
    {
        $this->authorize('delete', $retard);

        $retard->delete();

        return response()->json(null, 204);
    }
}
