<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRetardRequest;
use App\Models\Retard;

class RetardController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Retard::class);

        return response()->json(Retard::all());
    }

    public function store(StoreRetardRequest $request)
    {
        $validated = $request->validated();

        $this->authorize('create', [Retard::class, (int) $validated['id_eleve']]);

        $validated['id_utilisateur'] = auth()->id();

        $retard = Retard::create($validated);

        return response()->json($retard, 201);
    }

    public function show(Retard $retard)
    {
        $this->authorize('view', $retard);

        return response()->json($retard->load('eleve'));
    }

    public function update(StoreRetardRequest $request, Retard $retard)
    {
        $this->authorize('update', $retard);

        $retard->update($request->validated());

        return response()->json($retard);
    }

    public function destroy(Retard $retard)
    {
        $this->authorize('delete', $retard);

        $retard->delete();

        return response()->json(null, 204);
    }
}
