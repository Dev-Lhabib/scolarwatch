<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\SyntheseIA;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

class SyntheseSeeder extends Seeder
{
    /**
     * Seed a processed AI synthesis for every student and trimester. The alert
     * level, factors and parent message follow the student's profile, and a
     * handful of "moyen" alerts are marked as corrected by the direction.
     */
    public function run(): void
    {
        $eleves = Eleve::query()->with('classe')->orderBy('id_eleve')->get();
        $principaux = $this->principaux();
        $utilisateurs = User::query()->get()->keyBy('id');

        foreach ($eleves as $index => $eleve) {
            $ordinal = $index + 1;
            $profile = DemoData::profileFor($ordinal);
            $contenu = DemoData::synthesisFor($profile);

            $signer = $utilisateurs->get($principaux[$eleve->id_classe]);
            $signerRole = $signer?->role === 'direction' ? 'Direction' : 'Professeur principal';

            foreach (['T1', 'T2'] as $trimIndex => $trimestre) {
                $calendar = DemoData::trimesterDates($eleve->classe->annee_scolaire, $trimestre);
                $seed = $ordinal * 10 + $trimIndex;

                $messageParent = $contenu['message_parent'];

                if ($signer !== null) {
                    $messageParent .= "\n\nCordialement,\n\n{$signer->prenom} {$signer->nom}\n{$signerRole}";
                }

                $niveauAlerteCorrige = $contenu['niveau_alerte'] === 'moyen' && $seed % 11 === 0
                    ? 'eleve'
                    : null;

                SyntheseIA::create([
                    'trimestre' => $trimestre,
                    'statut' => 'traite',
                    'niveau_alerte' => $contenu['niveau_alerte'],
                    'niveau_alerte_corrige' => $niveauAlerteCorrige,
                    'facteurs_risque' => $contenu['facteurs_risque'],
                    'signaux_textuels' => $contenu['signaux_textuels'],
                    'recommandations' => $contenu['recommandations'],
                    'message_parent' => $messageParent,
                    'genere_le' => CarbonImmutable::parse($calendar['end'])->setTime(10, 0),
                    'id_eleve' => $eleve->id_eleve,
                    'id_utilisateur_demandeur' => $principaux[$eleve->id_classe],
                ]);
            }
        }
    }

    /**
     * @return array<int, int>
     */
    private function principaux(): array
    {
        $directionId = User::query()->where('role', 'direction')->orderBy('id')->value('id');

        return Classe::query()->get()
            ->mapWithKeys(
                fn (Classe $classe) => [
                    $classe->id_classe => $classe->id_utilisateur_principal ?? $directionId,
                ],
            )
            ->all();
    }
}
