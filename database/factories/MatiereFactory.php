<?php

namespace Database\Factories;

use App\Models\Matiere;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Matiere>
 */
class MatiereFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => fake()->unique()->randomElement([
                'Mathématiques', 'Physique-Chimie', 'SVT', 'Français',
                'Arabe', 'Anglais', 'Histoire-Géographie', 'Éducation Islamique',
            ]),
            'code' => fake()->unique()->lexify('???'),
        ];
    }
}
