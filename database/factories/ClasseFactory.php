<?php

namespace Database\Factories;

use App\Models\Classe;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Classe>
 */
class ClasseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => fake()->randomElement(['A', 'B', 'C']),
            'niveau' => fake()->randomElement(['1AC', '2AC', '3AC', 'TC', '1BAC', '2BAC']),
            'annee_scolaire' => '2025-2026',
            'capacite' => fake()->numberBetween(25, 35),
            'id_utilisateur_principal' => null,
        ];
    }
}
