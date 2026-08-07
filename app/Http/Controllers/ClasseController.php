<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClasseRequest;
use App\Http\Requests\UpdateClasseRequest;
use App\Models\Classe;
use Illuminate\Http\Request;

class ClasseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Classe::class);

        return response()->json(Classe::with('professeurPrincipal', 'enseignants')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClasseRequest $request)
    {
        $this->authorize('create', Classe::class);

        $classe = Classe::create($request->validated());

        return response()->json($classe, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Classe $classe)
    {
        $this->authorize('view', $classe);

        return response()->json($classe->load(['professeurPrincipal', 'enseignants', 'eleves']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClasseRequest $request, Classe $classe)
    {
        $this->authorize('update', $classe);

        $classe->update($request->validated());

        return response()->json($classe);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Classe $classe)
    {
        $this->authorize('delete', $classe);

        $classe->delete();

        return response()->json(null, 204);
    }

    /**
     * Display a listing of soft-deleted (archived) classes.
     */
    public function archived()
    {
        $this->authorize('viewArchived', Classe::class);

        return response()->json(Classe::onlyTrashed()->get());
    }

    /**
     * Restore a soft-deleted (archived) classe.
     */
    public function restore(Classe $classe)
    {
        $this->authorize('restore', $classe);

        $classe->restore();

        return response()->json($classe);
    }

    /**
     * Permanently delete a soft-deleted (archived) classe.
     */
    public function forceDelete(Classe $classe)
    {
        $this->authorize('forceDelete', $classe);

        $classe->forceDelete();

        return response()->json(null, 204);
    }

    /**
     * Archive (soft-delete) multiple classes in one request.
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
