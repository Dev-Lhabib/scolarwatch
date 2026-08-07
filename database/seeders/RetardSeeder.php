<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Retard;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class RetardSeeder extends Seeder
{
    /**
     * Seed retards across both trimesters, the count matching the student's
     * academic profile.
     */
    public function run(): void
    {
        $eleves = Eleve::query()->with('classe')->orderBy('id_eleve')->get();
        $principaux = $this->principaux();

        $retards = [];

        foreach ($eleves as $index => $eleve) {
            $ordinal = $index + 1;
            $profile = DemoData::profileFor($ordinal);
            $nombre = DemoData::retardsFor($profile);

            if ($nombre === 0) {
                continue;
            }

            foreach (['T1', 'T2'] as $trimIndex => $trimestre) {
                $calendar = DemoData::trimesterDates($eleve->classe->annee_scolaire, $trimestre);
                $start = CarbonImmutable::parse($calendar['start']);

                for ($i = 1; $i <= $nombre; $i++) {
                    $seed = $ordinal * 1000 + $trimIndex * 5 + $i;
                    $justifiee = (($i + $seed) % 5) === 0;
                    $date = $start->addDays(($i * 11 + $seed) % 50);

                    $retards[] = [
                        'date_retard' => $date->format('Y-m-d'),
                        'justifiee' => $justifiee,
                        'minutes_retard' => 5 * (1 + DemoData::between(0, 7, $seed + 50)),
                        'motif' => $justifiee
                            ? DemoData::pick([
                                'Rendez-vous médical',
                                'Problème de transport',
                                'Réveil tardif',
                                'Raisons familiales',
                            ], $seed)
                            : null,
                        'id_eleve' => $eleve->id_eleve,
                        'id_utilisateur' => $principaux[$eleve->id_classe],
                        'created_at' => $date->format('Y-m-d 08:30:00'),
                        'updated_at' => $date->format('Y-m-d 08:30:00'),
                    ];
                }
            }
        }

        $chunks = Collection::make($retards)->chunk(500);

        $chunks->each(fn (Collection $chunk) => Retard::insert($chunk->all()));
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
