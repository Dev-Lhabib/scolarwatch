<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMatiereRequest;
use App\Models\Matiere;

/**
 * Gestion des matières enseignées.
 *
 * @group Matières
 */
class MatiereController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @response [
     *  {
     *      "id_matiere": 1,
     *      "nom": "Mathématiques",
     *      "code": "MATH",
     *      "created_at": "2025-09-01T09:00:00.000000Z",
     *      "updated_at": "2025-09-01T09:00:00.000000Z"
     *  }
     * ]
     */
    public function index()
    {
        return response()->json(Matiere::all());
    }

    /**
     * Store a newly created resource in storage.
     *
     * Réservé au rôle `admin` (contrôlé par le FormRequest).
     *
     * @response status=201 {
     *  "id_matiere": 2,
     *  "nom": "Physique-Chimie",
     *  "code": "PC",
     *  "created_at": "2025-09-01T10:00:00.000000Z",
     *  "updated_at": "2025-09-01T10:00:00.000000Z"
     * }
     */
    public function store(StoreMatiereRequest $request)
    {
        $matiere = Matiere::create($request->validated());

        return response()->json($matiere, 201);
    }

    /**
     * Display the specified resource.
     *
     * @urlParam matiere integer required L'ID de la matière. Example: 2
     *
     * @response {
     *  "id_matiere": 2,
     *  "nom": "Physique-Chimie",
     *  "code": "PC",
     *  "created_at": "2025-09-01T10:00:00.000000Z",
     *  "updated_at": "2025-09-01T10:00:00.000000Z"
     * }
     */
    public function show(Matiere $matiere)
    {
        return response()->json($matiere);
    }

    /**
     * Update the specified resource in storage.
     *
     * @urlParam matiere integer required L'ID de la matière à modifier. Example: 2
     *
     * @response {
     *  "id_matiere": 2,
     *  "nom": "Physique-Chimie",
     *  "code": "PC",
     *  "created_at": "2025-09-01T10:00:00.000000Z",
     *  "updated_at": "2025-09-03T09:00:00.000000Z"
     * }
     */
    public function update(StoreMatiereRequest $request, Matiere $matiere)
    {
        $matiere->update($request->validated());

        return response()->json($matiere);
    }

    /**
     * Remove the specified resource from storage.
     *
     * Réservé au rôle `admin`.
     *
     * @urlParam matiere integer required L'ID de la matière à supprimer. Example: 2
     *
     * @response status=204
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
