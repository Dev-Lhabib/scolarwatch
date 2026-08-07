<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\User;
use Illuminate\Database\Seeder;

class TeacherSeeder extends Seeder
{
    /**
     * Assign every active teacher to every active class so each class has a
     * complete teaching team, then attach the archived teacher to the archived
     * class he used to supervise.
     */
    public function run(): void
    {
        $classes = Classe::all();
        $actives = $classes->filter(
            fn (Classe $classe) => $classe->annee_scolaire === '2025-2026',
        );
        $archivedClass = $classes->firstWhere('nom', '1AC-C');

        $enseignants = User::query()->where('role', 'enseignant')->get();

        foreach ($enseignants as $enseignant) {
            if ($enseignant->username === 'enseignant11') {
                if ($archivedClass !== null) {
                    $enseignant->classesEnseignees()->attach($archivedClass->id_classe);
                }

                continue;
            }

            foreach ($actives as $classe) {
                $enseignant->classesEnseignees()->attach($classe->id_classe);
            }
        }
    }
}
