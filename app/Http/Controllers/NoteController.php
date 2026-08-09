<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNoteRequest;
use App\Models\Note;

/**
 * Gestion des notes.
 *
 * @group Notes
 */
class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * Enseignants only see the notes they have recorded themselves. Admins and
     * direction see every note. This keeps the dashboard "Notes" count, the API
     * response and the saisie table in agreement.
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
     *      "updated_at": "2025-10-06T09:00:00.000000Z"
     *  }
     * ]
     */
    public function index()
    {
        $this->authorize('viewAny', Note::class);

        $query = Note::query();

        if (auth()->user()->role === 'enseignant') {
            $query->where('id_utilisateur', auth()->id());
        }

        return response()->json($query->get());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @response status=201 {
     *  "id_note": 56,
     *  "valeur": "18.00",
     *  "trimestre": "T1",
     *  "date": "2025-10-08",
     *  "id_eleve": 10,
     *  "id_matiere": 1,
     *  "id_utilisateur": 2,
     *  "created_at": "2025-10-08T09:00:00.000000Z",
     *  "updated_at": "2025-10-08T09:00:00.000000Z"
     * }
     * @response status=422 scenario="Note déjà saisie ou maximum atteint" {
     *  "message": "Une note existe déjà pour cet élève, cette matière, ce trimestre et cette date.",
     *  "errors": {
     *      "id_eleve": ["Une note existe déjà pour cet élève, cette matière, ce trimestre et cette date."]
     *  }
     * }
     */
    public function store(StoreNoteRequest $request)
    {
        $validated = $request->validated();

        $this->authorize('create', [Note::class, (int) $validated['id_eleve'], (int) $validated['id_matiere']]);

        $validated['id_utilisateur'] = auth()->id();

        $note = Note::create($validated);

        return response()->json($note, 201);
    }

    /**
     * Display the specified resource.
     *
     * @urlParam note integer required L'ID de la note. Example: 55
     *
     * @response {
     *  "id_note": 55,
     *  "valeur": "15.50",
     *  "trimestre": "T1",
     *  "date": "2025-10-06",
     *  "id_eleve": 10,
     *  "id_matiere": 1,
     *  "id_utilisateur": 2,
     *  "created_at": "2025-10-06T09:00:00.000000Z",
     *  "updated_at": "2025-10-06T09:00:00.000000Z",
     *  "eleve": {
     *      "id_eleve": 10,
     *      "nom": "Bernard",
     *      "prenom": "Léa",
     *      "genre": "F",
     *      "date_naissance": "2014-03-12",
     *      "code_massar": "M123456789",
     *      "photo": null,
     *      "id_classe": 1
     *  },
     *  "matiere": {
     *      "id_matiere": 1,
     *      "nom": "Mathématiques",
     *      "code": "MATH"
     *  }
     * }
     */
    public function show(Note $note)
    {
        $this->authorize('view', $note);

        return response()->json($note->load(['eleve', 'matiere']));
    }

    /**
     * Update the specified resource in storage.
     *
     * @urlParam note integer required L'ID de la note à modifier. Example: 55
     *
     * @response {
     *  "id_note": 55,
     *  "valeur": "16.00",
     *  "trimestre": "T1",
     *  "date": "2025-10-06",
     *  "id_eleve": 10,
     *  "id_matiere": 1,
     *  "id_utilisateur": 2,
     *  "created_at": "2025-10-06T09:00:00.000000Z",
     *  "updated_at": "2025-10-07T10:00:00.000000Z"
     * }
     */
    public function update(StoreNoteRequest $request, Note $note)
    {
        $this->authorize('update', $note);

        $note->update($request->validated());

        return response()->json($note);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @urlParam note integer required L'ID de la note à supprimer. Example: 55
     *
     * @response status=204
     */
    public function destroy(Note $note)
    {
        $this->authorize('delete', $note);

        $note->delete();

        return response()->json(null, 204);
    }
}
