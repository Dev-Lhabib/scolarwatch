<?php

namespace App\AI\Schemas;

use Illuminate\Contracts\JsonSchema\JsonSchema;

class SyntheseRisqueSchema
{
    /**
     * Define the structured output fields for the synthèse de risque de décrochage.
     *
     * @return array<string, mixed>
     */
    public static function fields(JsonSchema $schema): array
    {
        return [
            'niveau_alerte' => $schema->string()
                ->enum(['faible', 'moyen', 'eleve'])
                ->description('Le niveau de risque de décrochage identifié pour cet élève.')
                ->required(),

            'facteurs_risque' => $schema->array()
                ->items($schema->string())
                ->description('Liste des facteurs de risque identifiés (ex: absences répétées, baisse de notes, isolement social).')
                ->required(),

            'signaux_textuels' => $schema->array()
                ->items($schema->string())
                ->description('Extraits précis et littéraux des remarques des enseignants ayant motivé cette alerte, pour traçabilité.')
                ->required(),

            'recommandations' => $schema->array()
                ->items($schema->string())
                ->description('Recommandations d\'action concrètes pour le professeur principal ou la direction.')
                ->required(),

            'message_parent' => $schema->string()
                ->description('Message pré-rédigé, en français, destiné à être envoyé au parent après validation humaine.')
                ->required(),
        ];
    }
}
