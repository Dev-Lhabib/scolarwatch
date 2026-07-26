<?php

namespace Database\Factories;

use App\Models\Eleve;
use App\Models\Remarque;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Remarque>
 */
class RemarqueFactory extends Factory
{
    public function definition(): array
    {
        return [
            'contenu' => fake()->paragraph(),
            'categorie' => fake()->randomElement(['comportement', 'participation', 'assiduite']),
            'trimestre' => fake()->randomElement(['T1', 'T2', 'T3']),
            'date_remarque' => fake()->dateTimeBetween('-3 months', 'now'),
            'id_eleve' => Eleve::factory(),
            'id_utilisateur' => User::factory()->enseignant(),
        ];
    }
}
