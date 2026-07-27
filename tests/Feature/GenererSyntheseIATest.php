<?php

use App\Ai\Agents\GhostwriterAgent;
use App\Jobs\GenererSyntheseIA;
use App\Models\Eleve;
use App\Models\SyntheseIA;
use Illuminate\Support\Facades\Queue;

it('processes a synthese successfully and updates statut to traite', function () {
    $eleve = Eleve::factory()->create();

    $synthese = SyntheseIA::create([
        'trimestre' => 'T1',
        'statut' => 'en_attente',
        'id_eleve' => $eleve->id_eleve,
        'id_utilisateur_demandeur' => \App\Models\User::factory()->admin()->create()->id,
    ]);

    GhostwriterAgent::fake([
        [
            'niveau_alerte' => 'eleve',
            'facteurs_risque' => ['Absences répétées', 'Baisse de notes'],
            'signaux_textuels' => ['Ne participe plus depuis le retour des vacances.'],
            'recommandations' => ['Organiser un entretien avec la famille'],
            'message_parent' => 'Nous souhaitons échanger avec vous au sujet de la scolarité de votre enfant.',
        ],
    ]);

    (new GenererSyntheseIA($synthese))->handle();

    $synthese->refresh();

    expect($synthese->statut)->toBe('traite');
    expect($synthese->niveau_alerte)->toBe('eleve');
    expect($synthese->facteurs_risque)->toBe(['Absences répétées', 'Baisse de notes']);
    expect($synthese->signaux_textuels)->toBe(['Ne participe plus depuis le retour des vacances.']);
    expect($synthese->message_parent)->not->toBeNull();
    expect($synthese->genere_le)->not->toBeNull();
});

it('marks the synthese as echoue when the AI call fails', function () {
    $eleve = Eleve::factory()->create();

    $synthese = SyntheseIA::create([
        'trimestre' => 'T1',
        'statut' => 'en_attente',
        'id_eleve' => $eleve->id_eleve,
        'id_utilisateur_demandeur' => \App\Models\User::factory()->admin()->create()->id,
    ]);

    GhostwriterAgent::fake(function () {
        throw new \Exception('Groq API timeout');
    });

    (new GenererSyntheseIA($synthese))->handle();

    $synthese->refresh();

    expect($synthese->statut)->toBe('echoue');
    expect($synthese->niveau_alerte)->toBeNull();
});

it('dispatches the job to the queue', function () {
    Queue::fake();

    $eleve = Eleve::factory()->create();

    $synthese = SyntheseIA::create([
        'trimestre' => 'T1',
        'statut' => 'en_attente',
        'id_eleve' => $eleve->id_eleve,
        'id_utilisateur_demandeur' => \App\Models\User::factory()->admin()->create()->id,
    ]);

    GenererSyntheseIA::dispatch($synthese);

    Queue::assertPushed(GenererSyntheseIA::class, function ($job) use ($synthese) {
        return $job->synthese->id_synthese === $synthese->id_synthese;
    });
});
