<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEleveRequest;
use App\Models\Classe;
use App\Models\Eleve;
use Illuminate\Http\Request;

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

    /**
     * Display a listing of soft-deleted (archived) eleves.
     */
    public function archived()
    {
        $this->authorize('viewArchived', Eleve::class);

        return response()->json(Eleve::onlyTrashed()->get());
    }

    /**
     * Restore a soft-deleted (archived) eleve.
     */
    public function restore(Eleve $eleve)
    {
        $this->authorize('restore', $eleve);

        $eleve->restore();

        return response()->json($eleve);
    }

    /**
     * Permanently delete a soft-deleted (archived) eleve.
     */
    public function forceDelete(Eleve $eleve)
    {
        $this->authorize('forceDelete', $eleve);

        $eleve->forceDelete();

        return response()->json(null, 204);
    }

    /**
     * Archive (soft-delete) multiple eleves in one request.
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
