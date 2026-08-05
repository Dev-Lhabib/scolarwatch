<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNoteRequest;
use App\Models\Note;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * Enseignants only see the notes they have recorded themselves. Admins and
     * direction see every note. This keeps the dashboard "Notes" count, the API
     * response and the saisie table in agreement.
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
     */
    public function show(Note $note)
    {
        $this->authorize('view', $note);

        return response()->json($note->load(['eleve', 'matiere']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreNoteRequest $request, Note $note)
    {
        $this->authorize('update', $note);

        $note->update($request->validated());

        return response()->json($note);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Note $note)
    {
        $this->authorize('delete', $note);

        $note->delete();

        return response()->json(null, 204);
    }
}
