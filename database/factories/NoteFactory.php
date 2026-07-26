<?php

namespace Database\Factories;

use App\Models\Eleve;
use App\Models\Matiere;
use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Note>
 */
class NoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'valeur' => fake()->randomFloat(2, 0, 20),
            'trimestre' => fake()->randomElement(['T1', 'T2', 'T3']),
            'date' => fake()->dateTimeBetween('-3 months', 'now'),
            'id_eleve' => Eleve::factory(),
            'id_matiere' => Matiere::factory(),
            'id_utilisateur' => User::factory()->enseignant(),
        ];
    }
}
