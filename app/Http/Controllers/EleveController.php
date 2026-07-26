<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEleveRequest;
use App\Models\Eleve;

class EleveController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Eleve::class);

        return response()->json(Eleve::all());
    }

    /**
     * Store a newly created resource in storage.
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
     */
    public function show(Eleve $eleve)
    {
        $this->authorize('view', $eleve);

        return response()->json($eleve->load(['classe', 'tuteurs']));
    }

    /**
     * Update the specified resource in storage.
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
     */
    public function destroy(Eleve $eleve)
    {
        $this->authorize('delete', $eleve);

        $eleve->delete();

        return response()->json(null, 204);
    }
}
