<?php

namespace Database\Seeders;

use App\Models\Matiere;
use Illuminate\Database\Seeder;

class MatiereSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $matieres = [
            ['nom' => 'Mathématiques', 'code' => 'MATH'],
            ['nom' => 'Physique-Chimie', 'code' => 'PC'],
            ['nom' => 'SVT', 'code' => 'SVT'],
            ['nom' => 'Français', 'code' => 'FR'],
            ['nom' => 'Arabe', 'code' => 'AR'],
            ['nom' => 'Anglais', 'code' => 'ANG'],
        ];

        foreach ($matieres as $matiere) {
            Matiere::create($matiere);
        }
    }
}
