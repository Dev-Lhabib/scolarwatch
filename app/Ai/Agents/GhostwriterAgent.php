<?php

namespace App\Ai\Agents;

use App\Ai\Schemas\SyntheseRisqueSchema;
use App\Models\Eleve;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider(Lab::Groq)]
#[Model('llama-3.3-70b-versatile')]
class GhostwriterAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return <<<'INSTRUCTIONS'
            Tu es un assistant pédagogique pour un établissement scolaire marocain.
            Ta mission : analyser les données d'un trimestre pour un élève (notes, absences,
            retards, remarques des enseignants) et produire une synthèse structurée du risque
            de décrochage scolaire.

            Sois particulièrement attentif au texte libre des remarques des enseignants : c'est
            la source d'information la plus riche pour détecter des signaux faibles (isolement,
            changement de comportement, perte de motivation) qu'un simple comptage de chiffres
            ne peut pas capter.

            Cite les phrases exactes des remarques qui justifient ton analyse dans le champ
            signaux_textuels, pour que le professeur principal puisse vérifier ton raisonnement.

            Le message destiné au parent doit être écrit en français, avec un ton bienveillant
            et factuel, sans jargon technique.
            INSTRUCTIONS;
    }

    /**
     * Build the prompt for a given eleve's trimestre data.
     */
    public function promptFor(Eleve $eleve, string $trimestre): string
    {
        $notes = $eleve->notes()
            ->where('trimestre', $trimestre)
            ->with('matiere')
            ->get()
            ->map(fn ($note) => "{$note->matiere->nom}: {$note->valeur}/20 ({$note->date->format('d/m/Y')})")
            ->implode("\n");

        $absences = $eleve->absences()
            ->get()
            ->map(fn ($a) => "Absence le {$a->date_absence->format('d/m/Y')}".($a->justifiee ? ' (justifiée)' : ' (non justifiée)').($a->motif ? " - {$a->motif}" : ''))
            ->implode("\n");

        $retards = $eleve->retards()
            ->get()
            ->map(fn ($r) => "Retard le {$r->date_retard->format('d/m/Y')} ({$r->minutes_retard} min)".($r->motif ? " - {$r->motif}" : ''))
            ->implode("\n");

        $remarques = $eleve->remarques()
            ->where('trimestre', $trimestre)
            ->get()
            ->map(fn ($r) => "[{$r->date_remarque->format('d/m/Y')}] {$r->contenu}")
            ->implode("\n");

        return <<<PROMPT
            Élève : {$eleve->prenom} {$eleve->nom}
            Trimestre : {$trimestre}

            Notes :
            {$notes}

            Absences :
            {$absences}

            Retards :
            {$retards}

            Remarques des enseignants :
            {$remarques}

            Analyse ces données et produis la synthèse de risque de décrochage.
            PROMPT;
    }

    /**
     * Define the structured output schema.
     *
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return SyntheseRisqueSchema::fields($schema);
    }
}
