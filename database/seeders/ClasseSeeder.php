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
        $enseignants = User::query()
            ->where('role', 'enseignant')
            ->pluck('id', 'username');

        foreach (DemoData::classes() as $index => $definition) {
            $principal = match ($index) {
                10 => $enseignants->get('enseignant11'),
                11 => null,
                default => $enseignants->get('enseignant'.($index + 1)),
            };

            Classe::create([
                ...$definition,
                'id_utilisateur_principal' => $principal,
            ]);
        }
    }
}
