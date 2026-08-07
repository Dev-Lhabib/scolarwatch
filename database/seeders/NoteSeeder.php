<?php

namespace Database\Seeders;

use App\Models\Eleve;
use App\Models\Matiere;
use App\Models\Note;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class NoteSeeder extends Seeder
{
    /**
     * Seed three notes per subject per trimester (Contrôle 1, Contrôle 2,
     * Examen) with values consistent with the student's academic profile.
     */
    public function run(): void
    {
        $eleves = Eleve::query()->with('classe')->orderBy('id_eleve')->get();
        $matieres = Matiere::query()->orderBy('id_matiere')->get();
        $enseignantsParMatiere = User::query()
            ->where('role', 'enseignant')
            ->whereNotNull('id_matiere')
            ->pluck('id', 'id_matiere');

        $notes = [];

        foreach ($eleves as $index => $eleve) {
            $ordinal = $index + 1;
            $profile = DemoData::profileFor($ordinal);
            [$min, $max] = DemoData::noteRangeFor($profile);

            foreach ($matieres as $matiereIndex => $matiere) {
                $enseignantId = $enseignantsParMatiere->get($matiere->id_matiere);

                if ($enseignantId === null) {
                    continue;
                }

                foreach (['T1', 'T2'] as $trimIndex => $trimestre) {
                    $calendar = DemoData::trimesterDates($eleve->classe->annee_scolaire, $trimestre);

                    foreach ([$calendar['c1'], $calendar['c2'], $calendar['exam']] as $noteIndex => $baseDate) {
                        $seed = $ordinal * 1000 + $matiereIndex * 37 + $noteIndex * 7 + $trimIndex * 3;

                        $date = CarbonImmutable::parse($baseDate)
                            ->addDays(DemoData::between(0, 2, $seed + 101));

                        $notes[] = [
                            'valeur' => DemoData::between($min * 10, $max * 10, $seed) / 10,
                            'trimestre' => $trimestre,
                            'date' => $date->format('Y-m-d'),
                            'id_eleve' => $eleve->id_eleve,
                            'id_matiere' => $matiere->id_matiere,
                            'id_utilisateur' => $enseignantId,
                            'created_at' => $date->format('Y-m-d 10:00:00'),
                            'updated_at' => $date->format('Y-m-d 10:00:00'),
                        ];
                    }
                }
            }
        }

        $this->bulkInsert(Note::class, $notes);
    }

    /**
     * Insert rows in chunks, bypassing individual model saves.
     *
     * @param  array<int, array<string, mixed>>  $rows
     */
    private function bulkInsert(string $model, array $rows): void
    {
        $chunks = Collection::make($rows)->chunk(500);

        $chunks->each(fn (Collection $chunk) => $model::insert($chunk->all()));
    }
}
