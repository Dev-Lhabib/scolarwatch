<?php

namespace Database\Seeders;

use App\Models\Matiere;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->admin()->create([
            'nom' => 'Admin',
            'prenom' => 'ScolarWatch',
            'username' => 'admin',
            'email' => 'admin@scolarwatch.test',
        ]);

        User::factory()->direction()->create([
            'nom' => 'Direction',
            'prenom' => 'ScolarWatch',
            'username' => 'direction',
            'email' => 'direction@scolarwatch.test',
        ]);

        $matieres = Matiere::all();

        User::factory()
            ->count(3)
            ->enseignant()
            ->sequence(fn ($sequence) => [
                'id_matiere' => $matieres[$sequence->index]->id_matiere,
                'username' => 'enseignant'.($sequence->index + 1),
                'email' => 'enseignant'.($sequence->index + 1).'@scolarwatch.test',
            ])
            ->create();

        User::factory()
            ->count(10)
            ->parent()
            ->sequence(fn ($sequence) => [
                'username' => 'parent'.($sequence->index + 1),
                'email' => 'parent'.($sequence->index + 1).'@scolarwatch.test',
            ])
            ->create();
    }
}
