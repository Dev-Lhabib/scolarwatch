<?php

namespace Database\Seeders;

use App\Models\Absence;
use App\Models\Eleve;
use App\Models\Matiere;
use App\Models\Note;
use App\Models\Remarque;
use App\Models\Retard;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudentPerformanceSeeder extends Seeder
{
    /**
     * Seed a realistic T1 performance history for the first existing student.
     */
    public function run(): void
    {
        $eleve = Eleve::query()->with('classe')->first();

        if ($eleve === null) {
            return;
        }

        $principal = $eleve->classe?->id_utilisateur_principal !== null
            ? User::find($eleve->classe->id_utilisateur_principal)
            : User::query()->where('role', 'enseignant')->first();

        if ($principal === null) {
            return;
        }

        $notes = [
            ['code' => 'MATH', 'valeur' => 15, 'date' => '2025-10-06'],
            ['code' => 'MATH', 'valeur' => 12, 'date' => '2025-11-17'],
            ['code' => 'PC', 'valeur' => 9, 'date' => '2025-09-22'],
            ['code' => 'SVT', 'valeur' => 14, 'date' => '2025-11-03'],
            ['code' => 'FR', 'valeur' => 11, 'date' => '2025-10-20'],
            ['code' => 'FR', 'valeur' => 8, 'date' => '2025-12-08'],
            ['code' => 'AR', 'valeur' => 16, 'date' => '2025-11-24'],
            ['code' => 'ANG', 'valeur' => 13, 'date' => '2025-12-15'],
        ];

        $absences = [
            ['date' => '2025-09-18', 'justifiee' => false, 'motif' => null],
            ['date' => '2025-11-06', 'justifiee' => true, 'motif' => 'Rendez-vous médical'],
            ['date' => '2025-12-11', 'justifiee' => true, 'motif' => 'Maladie (certificat médical)'],
        ];

        $retards = [
            ['date' => '2025-10-09', 'minutes' => 10, 'justifiee' => false, 'motif' => null],
            ['date' => '2025-12-04', 'minutes' => 20, 'justifiee' => true, 'motif' => 'Problème de transport'],
        ];

        $remarques = [
            [
                'date' => '2025-10-14',
                'categorie' => 'participation',
                'contenu' => "Très participatif en classe, pose des questions pertinentes et s'investit dans les travaux de groupe.",
            ],
            [
                'date' => '2025-11-19',
                'categorie' => 'comportement',
                'contenu' => 'Distrait en classe et bavarde régulièrement pendant les cours.',
            ],
            [
                'date' => '2025-12-02',
                'categorie' => 'assiduite',
                'contenu' => 'Rend ses devoirs en retard et manque de régularité dans son travail personnel.',
            ],
            [
                'date' => '2025-12-17',
                'categorie' => 'comportement',
                'contenu' => 'Progrès notables en lecture et en expression écrite ce trimestre.',
            ],
        ];

        $eleve->notes()->where('trimestre', 'T1')->delete();
        $eleve->absences()->delete();
        $eleve->retards()->delete();
        $eleve->remarques()->where('trimestre', 'T1')->delete();

        foreach ($notes as $note) {
            $matiere = Matiere::query()->where('code', $note['code'])->first();

            if ($matiere === null) {
                continue;
            }

            $enseignant = User::query()
                ->where('role', 'enseignant')
                ->where('id_matiere', $matiere->id_matiere)
                ->first() ?? $principal;

            Note::create([
                'valeur' => $note['valeur'],
                'trimestre' => 'T1',
                'date' => $note['date'],
                'id_eleve' => $eleve->id_eleve,
                'id_matiere' => $matiere->id_matiere,
                'id_utilisateur' => $enseignant->id,
            ]);
        }

        foreach ($absences as $absence) {
            Absence::create([
                'date_absence' => $absence['date'],
                'justifiee' => $absence['justifiee'],
                'motif' => $absence['motif'],
                'id_eleve' => $eleve->id_eleve,
                'id_utilisateur' => $principal->id,
            ]);
        }

        foreach ($retards as $retard) {
            Retard::create([
                'date_retard' => $retard['date'],
                'justifiee' => $retard['justifiee'],
                'minutes_retard' => $retard['minutes'],
                'motif' => $retard['motif'],
                'id_eleve' => $eleve->id_eleve,
                'id_utilisateur' => $principal->id,
            ]);
        }

        foreach ($remarques as $remarque) {
            Remarque::create([
                'contenu' => $remarque['contenu'],
                'categorie' => $remarque['categorie'],
                'trimestre' => 'T1',
                'date_remarque' => $remarque['date'],
                'id_eleve' => $eleve->id_eleve,
                'id_utilisateur' => $principal->id,
            ]);
        }
    }
}
