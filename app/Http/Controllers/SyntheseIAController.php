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

/**
 * Synthèses IA de décrochage scolaire.
 *
 * @group Synthèses IA
 */
class SyntheseIAController extends Controller
{
    /**
     * Trigger a new synthese IA for the given eleve and trimestre.
     *
     * La génération est lancée de façon asynchrone (job en file d'attente) :
     * l'endpoint retourne immédiatement la synthèse créée au statut `en_attente`.
     *
     * @urlParam eleve integer required L'ID de l'élève. Example: 10
     *
     * @bodyParam trimestre string required Le trimestre concerné (T1, T2, T3). Example: T1
     *
     * @response status=202 {
     *  "id_synthese": 3,
     *  "trimestre": "T1",
     *  "statut": "en_attente",
     *  "niveau_alerte": null,
     *  "niveau_alerte_corrige": null,
     *  "facteurs_risque": null,
     *  "signaux_textuels": null,
     *  "recommandations": null,
     *  "message_parent": null,
     *  "genere_le": null,
     *  "id_eleve": 10,
     *  "id_utilisateur_demandeur": 2,
     *  "created_at": "2025-11-03T09:00:00.000000Z",
     *  "updated_at": "2025-11-03T09:00:00.000000Z"
     * }
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
     *
     * Retourne la synthèse la plus récente de l'élève pour le trimestre donné.
     *
     * @urlParam eleve integer required L'ID de l'élève. Example: 10
     *
     * @queryParam trimestre string required Le trimestre concerné (T1, T2, T3). Example: T1
     *
     * @response {
     *  "id_synthese": 3,
     *  "trimestre": "T1",
     *  "statut": "termine",
     *  "niveau_alerte": "moyen",
     *  "niveau_alerte_corrige": null,
     *  "facteurs_risque": [
     *      "Absentéisme",
     *      "Baisse des notes"
     *  ],
     *  "signaux_textuels": [
     *      "Plusieurs retards en mathématiques."
     *  ],
     *  "recommandations": [
     *      "Planifier un entretien avec les parents."
     *  ],
     *  "message_parent": "Votre enfant rencontre des difficultés...",
     *  "genere_le": "2025-11-03T09:15:00.000000Z",
     *  "id_eleve": 10,
     *  "id_utilisateur_demandeur": 2,
     *  "created_at": "2025-11-03T09:00:00.000000Z",
     *  "updated_at": "2025-11-03T09:15:00.000000Z"
     * }
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
     *
     * @urlParam synthese integer required L'ID de la synthèse. Example: 3
     *
     * @bodyParam niveau_alerte_corrige string required La valeur corrigée : `faible`, `moyen` ou `eleve`. Example: eleve
     *
     * @response {
     *  "id_synthese": 3,
     *  "trimestre": "T1",
     *  "statut": "termine",
     *  "niveau_alerte": "moyen",
     *  "niveau_alerte_corrige": "eleve",
     *  "facteurs_risque": [
     *      "Absentéisme",
     *      "Baisse des notes"
     *  ],
     *  "signaux_textuels": [
     *      "Plusieurs retards en mathématiques."
     *  ],
     *  "recommandations": [
     *      "Planifier un entretien avec les parents."
     *  ],
     *  "message_parent": "Votre enfant rencontre des difficultés...",
     *  "genere_le": "2025-11-03T09:15:00.000000Z",
     *  "id_eleve": 10,
     *  "id_utilisateur_demandeur": 2,
     *  "created_at": "2025-11-03T09:00:00.000000Z",
     *  "updated_at": "2025-11-04T09:00:00.000000Z"
     * }
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
     *
     * @urlParam synthese integer required L'ID de la synthèse. Example: 3
     *
     * @response scenario="Envoi réussi" {
     *  "message": "Notifications envoyées.",
     *  "nombre_tuteurs": 2
     * }
     * @response status=422 scenario="Aucun message à envoyer" {
     *  "message": "La synthèse n'a pas encore de message à envoyer."
     * }
     * @response status=422 scenario="Aucun tuteur associé" {
     *  "message": "Aucun tuteur associé à cet élève."
     * }
     */
    public function envoyer(SyntheseIA $synthese)
    {
        $this->authorize('corriger', $synthese);

        if (is_null($synthese->message_parent)) {
            return response()->json([
                'message' => 'La synthèse n\'a pas encore de message à envoyer.',
            ], 422);
        }

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
