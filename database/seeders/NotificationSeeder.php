<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\SyntheseIA;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NotificationSeeder extends Seeder
{
    /**
     * Seed the alert notifications generated from "moyen" and "eleve"
     * syntheses, sent to the first parent of the student over Email or
     * WhatsApp with realistic delivery and read statuses.
     */
    public function run(): void
    {
        $syntheses = SyntheseIA::query()
            ->whereIn('niveau_alerte', ['moyen', 'eleve'])
            ->with('eleve.tuteurs')
            ->orderBy('id_synthese')
            ->get();

        $notifications = [];

        foreach ($syntheses as $synthese) {
            $tuteur = $synthese->eleve->tuteurs->sortBy('id')->first();

            if ($tuteur === null) {
                continue;
            }

            $seed = $synthese->id_synthese;
            $canal = $seed % 2 === 0 ? 'Email' : 'WhatsApp';

            $statut = match (true) {
                $seed % 10 === 0 => 'echec',
                $seed % 10 === 1 => 'en_attente',
                default => 'envoye',
            };

            $lu = $statut === 'envoye' && ($synthese->trimestre === 'T1' || $seed % 3 === 0);
            $envoyeLe = $statut === 'envoye' && $synthese->genere_le !== null
                ? $synthese->genere_le->addMinutes(15)->format('Y-m-d H:i:s')
                : null;

            $notifications[] = [
                'titre' => "Alerte décrochage – {$synthese->trimestre} ({$canal})",
                'message' => $synthese->message_parent,
                'statut_envoi' => $statut,
                'envoye_le' => $envoyeLe,
                'lu' => $lu,
                'id_utilisateur_destinataire' => $tuteur->id,
                'id_synthese' => $synthese->id_synthese,
                'created_at' => $synthese->genere_le?->format('Y-m-d H:i:s') ?? now()->format('Y-m-d H:i:s'),
                'updated_at' => now()->format('Y-m-d H:i:s'),
            ];
        }

        $chunks = collect($notifications)->chunk(500);

        $chunks->each(function ($chunk) {
            DB::table('notifications')->insert($chunk->all());
        });
    }
}
