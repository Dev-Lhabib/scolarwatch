<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\Eleve;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

class EleveSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classes = Classe::all();
        $prenoms = DemoData::prenoms();
        $noms = DemoData::noms();

        for ($ordinal = 1; $ordinal <= DemoData::studentCount(); $ordinal++) {
            $classe = $classes[DemoData::classeForOrdinal($ordinal)];
            [$anneeDebut] = explode('-', $classe->annee_scolaire);

            $dateNaissance = CarbonImmutable::create(
                (int) $anneeDebut - DemoData::ageForNiveau($classe->niveau),
                1 + (($ordinal * 3) % 12),
                1 + (($ordinal * 7) % 27),
            );

            Eleve::create([
                'nom' => $noms[($ordinal * 7) % count($noms)],
                'prenom' => $prenoms[($ordinal - 1) % count($prenoms)],
                'genre' => $ordinal % 2 === 0 ? 'F' : 'M',
                'date_naissance' => $dateNaissance->format('Y-m-d'),
                'code_massar' => 'M'.str_pad((string) (1000000 + $ordinal * 997), 8, '0', STR_PAD_LEFT),
                'photo' => null,
                'id_classe' => $classe->id_classe,
            ]);
        }
    }
}
