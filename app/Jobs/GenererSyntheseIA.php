<?php

namespace App\Jobs;

use App\Ai\Agents\GhostwriterAgent;
use App\Models\SyntheseIA;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class GenererSyntheseIA implements ShouldQueue
{
    use Queueable;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public SyntheseIA $synthese,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $eleve = $this->synthese->eleve;

            $signer = $eleve?->classe?->professeurPrincipal ?? $this->synthese->demandeur;
            $signerRole = $eleve?->classe?->professeurPrincipal ? 'Professeur principal' : 'Enseignant';

            $agent = new GhostwriterAgent;
            $prompt = $agent->promptFor($eleve, $this->synthese->trimestre, $signer, $signerRole);

            /** @var array $result */
            $result = $agent->prompt($prompt);

            $this->synthese->update([
                'statut' => 'traite',
                'niveau_alerte' => $result['niveau_alerte'],
                'facteurs_risque' => $result['facteurs_risque'],
                'signaux_textuels' => $result['signaux_textuels'],
                'recommandations' => $result['recommandations'],
                'message_parent' => $result['message_parent'],
                'genere_le' => now(),
            ]);
        } catch (Throwable $e) {
            Log::error('Échec de la génération de la synthèse IA', [
                'id_synthese' => $this->synthese->id_synthese,
                'error' => $e->getMessage(),
            ]);

            $this->synthese->update(['statut' => 'echoue']);
        }
    }
}
