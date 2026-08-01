<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class ParentController extends Controller
{
    /**
     * The eleves for which the authenticated user is a tuteur, with their classe.
     * Scoped to the authenticated parent only.
     */
    public function children(): JsonResponse
    {
        return response()->json(
            auth()->user()->eleves()->with('classe')->get()
        );
    }
}
