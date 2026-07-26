<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClasseRequest;
use App\Models\Classe;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClasseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Classe::class);

        return response()->json(Classe::all());
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
    public function update(StoreClasseRequest $request, Classe $classe)
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
     * Designate the professeur principal for this classe.
     */
    public function assignProfesseurPrincipal(Request $request, Classe $classe)
    {
        $this->authorize('update', $classe);

        $validated = $request->validate([
            'id_utilisateur_principal' => [
                'required',
                Rule::exists('users', 'id')->where('role', 'enseignant'),
            ],
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
            'id_utilisateur' => [
                'required',
                Rule::exists('users', 'id')->where('role', 'enseignant'),
            ],
        ]);

        $classe->enseignants()->syncWithoutDetaching([$validated['id_utilisateur']]);

        return response()->json($classe->load('enseignants'));
    }
}
