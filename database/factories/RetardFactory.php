<?php

namespace Database\Factories;

use App\Models\Eleve;
use App\Models\Retard;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Retard>
 */
class RetardFactory extends Factory
{
    public function definition(): array
    {
        return [
            'date_retard' => fake()->dateTimeBetween('-3 months', 'now'),
            'justifiee' => fake()->boolean(30),
            'minutes_retard' => fake()->numberBetween(5, 45),
            'motif' => fake()->optional()->sentence(),
            'id_eleve' => Eleve::factory(),
            'id_utilisateur' => User::factory()->enseignant(),
        ];
    }
}
