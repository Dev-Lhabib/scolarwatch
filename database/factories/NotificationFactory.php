<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'titre' => fake()->sentence(4),
            'message' => fake()->paragraph(),
            'statut_envoi' => fake()->randomElement(['envoye', 'echec', 'en_attente']),
            'envoye_le' => now(),
            'lu' => fake()->boolean(30),
            'id_utilisateur_destinataire' => User::factory()->parent(),
            'id_synthese' => null,
        ];
    }

    /**
     * Indicate that the notification has been sent.
     */
    public function envoyee(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut_envoi' => 'envoye',
            'envoye_le' => now(),
        ]);
    }
}
