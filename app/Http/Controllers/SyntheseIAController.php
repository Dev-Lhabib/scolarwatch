<?php

namespace App\Http\Controllers;

use App\Jobs\GenererSyntheseIA;
use App\Models\Eleve;
use App\Models\Notification as NotificationModel;
use App\Models\SyntheseIA;
use App\Notifications\DecrochageAlertNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
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

    /**
     * Validate and send the synthese's message to all tuteurs of the eleve.
     * Creates a Notification record per parent and dispatches the mail notification.
     */
    public function envoyer(SyntheseIA $synthese)
    {
        $this->authorize('corriger', $synthese);

        $eleve = $synthese->eleve;
        $tuteurs = $eleve->tuteurs;

        if ($tuteurs->isEmpty()) {
            return response()->json([
                'message' => 'Aucun tuteur associé à cet élève.',
            ], 422);
        }

        foreach ($tuteurs as $tuteur) {
            $notification = NotificationModel::create([
                'titre' => "Concernant la scolarité de {$eleve->prenom} {$eleve->nom}",
                'message' => $synthese->message_parent,
                'statut_envoi' => 'en_attente',
                'id_utilisateur_destinataire' => $tuteur->id,
                'id_synthese' => $synthese->id_synthese,
            ]);

            try {
                Notification::send($tuteur, new DecrochageAlertNotification($synthese));

                $notification->update([
                    'statut_envoi' => 'envoye',
                    'envoye_le' => now(),
                ]);
            } catch (\Throwable $e) {
                $notification->update(['statut_envoi' => 'echec']);
            }
        }

        return response()->json([
            'message' => 'Notifications envoyées.',
            'nombre_tuteurs' => $tuteurs->count(),
        ]);
    }
}
