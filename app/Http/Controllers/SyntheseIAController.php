<?php

namespace App\Http\Controllers;

use App\Jobs\GenererSyntheseIA;
use App\Models\Eleve;
use App\Models\SyntheseIA;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SyntheseIAController extends Controller
{
    /**
     * Trigger a new synthese IA for the given eleve and trimestre.
     */
    public function store(Request $request, Eleve $eleve)
    {
        $this->authorize('creerPour', [SyntheseIA::class, $eleve]);

        $validated = $request->validate([
            'trimestre' => ['required', 'string', 'max:20'],
        ]);

        $synthese = SyntheseIA::create([
            'trimestre' => $validated['trimestre'],
            'statut' => 'en_attente',
            'id_eleve' => $eleve->id_eleve,
            'id_utilisateur_demandeur' => auth()->id(),
        ]);

        GenererSyntheseIA::dispatch($synthese);

        return response()->json($synthese, 202);
    }

    /**
     * Get the status and result of the synthese IA for a given eleve and trimestre.
     */
    public function show(Request $request, Eleve $eleve)
    {
        $validated = $request->validate([
            'trimestre' => ['required', 'string', 'max:20'],
        ]);

        $synthese = SyntheseIA::where('id_eleve', $eleve->id_eleve)
            ->where('trimestre', $validated['trimestre'])
            ->latest()
            ->firstOrFail();

        $this->authorize('view', $synthese);

        return response()->json($synthese);
    }

    /**
     * Correct the AI-proposed niveau_alerte. The original niveau_alerte is never
     * overwritten, preserving traceability of what the AI originally proposed.
     */
    public function corrigerNiveauAlerte(Request $request, SyntheseIA $synthese)
    {
        $this->authorize('corriger', $synthese);

        $validated = $request->validate([
            'niveau_alerte_corrige' => ['required', Rule::in(['faible', 'moyen', 'eleve'])],
        ]);

        $synthese->update(['niveau_alerte_corrige' => $validated['niveau_alerte_corrige']]);

        return response()->json($synthese);
    }
}
