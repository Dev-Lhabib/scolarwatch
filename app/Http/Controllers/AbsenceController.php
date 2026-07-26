<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAbsenceRequest;
use App\Models\Absence;

class AbsenceController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Absence::class);

        return response()->json(Absence::all());
    }

    public function store(StoreAbsenceRequest $request)
    {
        $validated = $request->validated();

        $this->authorize('create', [Absence::class, (int) $validated['id_eleve']]);

        $validated['id_utilisateur'] = auth()->id();

        $absence = Absence::create($validated);

        return response()->json($absence, 201);
    }

    public function show(Absence $absence)
    {
        $this->authorize('view', $absence);

        return response()->json($absence->load('eleve'));
    }

    public function update(StoreAbsenceRequest $request, Absence $absence)
    {
        $this->authorize('update', $absence);

        $absence->update($request->validated());

        return response()->json($absence);
    }

    public function destroy(Absence $absence)
    {
        $this->authorize('delete', $absence);

        $absence->delete();

        return response()->json(null, 204);
    }
}
