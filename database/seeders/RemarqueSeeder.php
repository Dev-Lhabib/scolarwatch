<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Remarque;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class RemarqueSeeder extends Seeder
{
    /**
     * Seed teacher remarks for both trimesters, the tone and count matching
     * the student's academic profile.
     */
    public function run(): void
    {
        $eleves = Eleve::query()->with('classe')->orderBy('id_eleve')->get();
        $principaux = $this->principaux();

        $remarques = [];

        foreach ($eleves as $index => $eleve) {
            $ordinal = $index + 1;
            $profile = DemoData::profileFor($ordinal);
            $templates = DemoData::remarksFor($profile);
            $nombre = DemoData::remarkCountFor($profile);

            foreach (['T1', 'T2'] as $trimIndex => $trimestre) {
                $calendar = DemoData::trimesterDates($eleve->classe->annee_scolaire, $trimestre);
                $start = CarbonImmutable::parse($calendar['start']);

                for ($i = 1; $i <= $nombre; $i++) {
                    $seed = $ordinal * 1000 + $trimIndex * 5 + $i;
                    $template = $templates[($i - 1) % count($templates)];
                    $date = $start->addDays(($i * 23 + $seed) % 55);

                    $remarques[] = [
                        'contenu' => $template['contenu'],
                        'categorie' => $template['categorie'],
                        'trimestre' => $trimestre,
                        'date_remarque' => $date->format('Y-m-d'),
                        'id_eleve' => $eleve->id_eleve,
                        'id_utilisateur' => $principaux[$eleve->id_classe],
                        'created_at' => $date->format('Y-m-d 14:00:00'),
                        'updated_at' => $date->format('Y-m-d 14:00:00'),
                    ];
                }
            }
        }

        $chunks = Collection::make($remarques)->chunk(500);

        $chunks->each(fn (Collection $chunk) => Remarque::insert($chunk->all()));
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
