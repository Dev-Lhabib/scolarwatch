<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRemarqueRequest;
use App\Models\Remarque;

class RemarqueController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Remarque::class);

        $query = Remarque::query();

        if (auth()->user()->role === 'enseignant') {
            $query->where('id_utilisateur', auth()->id());
        }

        return response()->json($query->get());
    }

    public function store(StoreRemarqueRequest $request)
    {
        $validated = $request->validated();

        $this->authorize('create', [Remarque::class, (int) $validated['id_eleve']]);

        $validated['id_utilisateur'] = auth()->id();

        $remarque = Remarque::create($validated);

        return response()->json($remarque, 201);
    }

    public function show(Remarque $remarque)
    {
        $this->authorize('view', $remarque);

        return response()->json($remarque->load('eleve'));
    }

    public function update(StoreRemarqueRequest $request, Remarque $remarque)
    {
        $this->authorize('update', $remarque);

        $remarque->update($request->validated());

        return response()->json($remarque);
    }

    public function destroy(Remarque $remarque)
    {
        $this->authorize('delete', $remarque);

        $remarque->delete();

        return response()->json(null, 204);
    }
}
