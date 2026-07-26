<?php

namespace Database\Factories;

use App\Models\Absence;
use App\Models\Eleve;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Absence>
 */
class AbsenceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'date_absence' => fake()->dateTimeBetween('-3 months', 'now'),
            'justifiee' => fake()->boolean(30),
            'motif' => fake()->optional()->sentence(),
            'id_eleve' => Eleve::factory(),
            'id_utilisateur' => User::factory()->enseignant(),
        ];
    }
}
