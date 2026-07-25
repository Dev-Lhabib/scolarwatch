<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\User;
use Illuminate\Database\Seeder;

class ClasseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $enseignants = User::where('role', 'enseignant')->get();

        Classe::factory()->create([
            'nom' => '1AC-A',
            'niveau' => '1AC',
            'annee_scolaire' => '2025-2026',
            'capacite' => 30,
            'id_utilisateur_principal' => $enseignants[0]->id,
        ]);

        Classe::factory()->create([
            'nom' => '1AC-B',
            'niveau' => '1AC',
            'annee_scolaire' => '2025-2026',
            'capacite' => 30,
            'id_utilisateur_principal' => $enseignants[1]->id,
        ]);
    }
}
