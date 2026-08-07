<?php

namespace Database\Seeders;

use App\Models\Absence;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class AbsenceSeeder extends Seeder
{
    /**
     * Seed absences across both trimesters, the count matching the student's
     * academic profile (from 0 for excellent pupils up to 15 for critical
     * ones).
     */
    public function run(): void
    {
        $eleves = Eleve::query()->with('classe')->orderBy('id_eleve')->get();
        $principaux = $this->principaux();

        $absences = [];

        foreach ($eleves as $index => $eleve) {
            $ordinal = $index + 1;
            $profile = DemoData::profileFor($ordinal);
            $nombre = DemoData::absencesFor($profile);

            if ($nombre === 0) {
                continue;
            }

            foreach (['T1', 'T2'] as $trimIndex => $trimestre) {
                $calendar = DemoData::trimesterDates($eleve->classe->annee_scolaire, $trimestre);
                $start = CarbonImmutable::parse($calendar['start']);

                for ($i = 1; $i <= $nombre; $i++) {
                    $seed = $ordinal * 1000 + $trimIndex * 5 + $i;
                    $justifiee = (($i + $seed) % 4) === 0;
                    $date = $start->addDays(($i * 17 + $seed) % 55);

                    $absences[] = [
                        'date_absence' => $date->format('Y-m-d'),
                        'justifiee' => $justifiee,
                        'motif' => $justifiee
                            ? DemoData::pick([
                                'Rendez-vous médical',
                                'Maladie (certificat médical)',
                                'Raisons familiales',
                                'Problème de transport',
                            ], $seed)
                            : null,
                        'id_eleve' => $eleve->id_eleve,
                        'id_utilisateur' => $principaux[$eleve->id_classe],
                        'created_at' => $date->format('Y-m-d 09:00:00'),
                        'updated_at' => $date->format('Y-m-d 09:00:00'),
                    ];
                }
            }
        }

        $chunks = Collection::make($absences)->chunk(500);

        $chunks->each(fn (Collection $chunk) => Absence::insert($chunk->all()));
    }

    /**
     * Map of id_classe => supervising user id (professeur principal, or the
     * first direction account as a fallback for archived classes).
     *
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
