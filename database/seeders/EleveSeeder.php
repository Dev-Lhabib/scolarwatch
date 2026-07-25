<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\User;
use Illuminate\Database\Seeder;

class EleveSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classes = Classe::all();
        $parents = User::where('role', 'parent')->get();

        for ($i = 0; $i < 10; $i++) {
            $eleve = Eleve::factory()->create([
                'id_classe' => $classes[$i % $classes->count()]->id_classe,
            ]);

            $eleve->tuteurs()->attach($parents[$i]->id);
        }
    }
}
