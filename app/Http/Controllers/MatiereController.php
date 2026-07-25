<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMatiereRequest;
use App\Models\Matiere;
use Illuminate\Http\Request;

class MatiereController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Matiere::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMatiereRequest $request)
    {
        $matiere = Matiere::create($request->validated());

        return response()->json($matiere, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Matiere $matiere)
    {
        return response()->json($matiere);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreMatiereRequest $request, Matiere $matiere)
    {
        $matiere->update($request->validated());

        return response()->json($matiere);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Matiere $matiere)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        $matiere->delete();

        return response()->json(null, 204);
    }
}
