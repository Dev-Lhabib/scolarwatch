<?php

namespace Database\Factories;

use App\Models\Classe;
use App\Models\Eleve;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Eleve>
 */
class EleveFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => fake()->lastName(),
            'prenom' => fake()->firstName(),
            'genre' => fake()->randomElement(['M', 'F']),
            'date_naissance' => fake()->dateTimeBetween('-16 years', '-11 years'),
            'code_massar' => strtoupper(fake()->unique()->bothify('??######')),
            'photo' => null,
            'id_classe' => Classe::factory(),
        ];
    }
}
