<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAbsenceRequest;
use App\Models\Absence;

/**
 * Gestion des absences.
 *
 * @group Absences
 */
class AbsenceController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * Les enseignants ne voient que les absences qu'ils ont eux-mêmes saisies.
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
     *      "updated_at": "2025-10-13T09:00:00.000000Z"
     *  }
     * ]
     */
    public function index()
    {
        $this->authorize('viewAny', Absence::class);

        $query = Absence::query();

        if (auth()->user()->role === 'enseignant') {
            $query->where('id_utilisateur', auth()->id());
        }

        return response()->json($query->get());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @response status=201 {
     *  "id_absence": 31,
     *  "date_absence": "2025-10-14",
     *  "justifiee": false,
     *  "motif": null,
     *  "id_eleve": 12,
     *  "id_utilisateur": 2,
     *  "created_at": "2025-10-14T08:00:00.000000Z",
     *  "updated_at": "2025-10-14T08:00:00.000000Z"
     * }
     * @response status=422 scenario="Absence déjà déclarée ce jour" {
     *  "message": "Cet élève a déjà une absence à cette date.",
     *  "errors": {
     *      "date_absence": ["Cet élève a déjà une absence à cette date."]
     *  }
     * }
     */
    public function store(StoreAbsenceRequest $request)
    {
        $validated = $request->validated();

        $this->authorize('create', [Absence::class, (int) $validated['id_eleve']]);

        $validated['id_utilisateur'] = auth()->id();

        $absence = Absence::create($validated);

        return response()->json($absence, 201);
    }

    /**
     * Display the specified resource.
     *
     * @urlParam absence integer required L'ID de l'absence. Example: 30
     *
     * @response {
     *  "id_absence": 30,
     *  "date_absence": "2025-10-13",
     *  "justifiee": true,
     *  "motif": "Rendez-vous médical",
     *  "id_eleve": 10,
     *  "id_utilisateur": 2,
     *  "created_at": "2025-10-13T09:00:00.000000Z",
     *  "updated_at": "2025-10-13T09:00:00.000000Z",
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
    public function show(Absence $absence)
    {
        $this->authorize('view', $absence);

        return response()->json($absence->load('eleve'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @urlParam absence integer required L'ID de l'absence à modifier. Example: 30
     *
     * @response {
     *  "id_absence": 30,
     *  "date_absence": "2025-10-13",
     *  "justifiee": true,
     *  "motif": "Certificat fourni",
     *  "id_eleve": 10,
     *  "id_utilisateur": 2,
     *  "created_at": "2025-10-13T09:00:00.000000Z",
     *  "updated_at": "2025-10-14T10:00:00.000000Z"
     * }
     */
    public function update(StoreAbsenceRequest $request, Absence $absence)
    {
        $this->authorize('update', $absence);

        $absence->update($request->validated());

        return response()->json($absence);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @urlParam absence integer required L'ID de l'absence à supprimer. Example: 30
     *
     * @response status=204
     */
    public function destroy(Absence $absence)
    {
        $this->authorize('delete', $absence);

        $absence->delete();

        return response()->json(null, 204);
    }
}
