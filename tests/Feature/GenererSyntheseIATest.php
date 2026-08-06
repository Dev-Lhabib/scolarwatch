<?php

use App\Ai\Agents\GhostwriterAgent;
use App\Jobs\GenererSyntheseIA;
use App\Models\Eleve;
use App\Models\SyntheseIA;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

it('processes a synthese successfully and updates statut to traite', function () {
    $eleve = Eleve::factory()->create();

    $synthese = SyntheseIA::create([
        'trimestre' => 'T1',
        'statut' => 'en_attente',
        'id_eleve' => $eleve->id_eleve,
        'id_utilisateur_demandeur' => User::factory()->admin()->create()->id,
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
        'id_utilisateur_demandeur' => User::factory()->admin()->create()->id,
    ]);

    GhostwriterAgent::fake(function () {
        throw new Exception('Groq API timeout');
    });

    (new GenererSyntheseIA($synthese))->handle();

    $synthese->refresh();

    expect($synthese->statut)->toBe('echoue');
    expect($synthese->niveau_alerte)->toBeNull();
});

it('signs the parent message with the professeur principal of the classe', function () {
    $principal = User::factory()->enseignant()->create(['prenom' => 'Amina', 'nom' => 'Benali']);

    $eleve = Eleve::factory()->create();
    $eleve->classe->update(['id_utilisateur_principal' => $principal->id]);

    $synthese = SyntheseIA::create([
        'trimestre' => 'T1',
        'statut' => 'en_attente',
        'id_eleve' => $eleve->id_eleve,
        'id_utilisateur_demandeur' => User::factory()->direction()->create()->id,
    ]);

    GhostwriterAgent::fake([
        [
            'niveau_alerte' => 'moyen',
            'facteurs_risque' => ['Absences répétées'],
            'signaux_textuels' => [],
            'recommandations' => [],
            'message_parent' => '...',
        ],
    ]);

    (new GenererSyntheseIA($synthese))->handle();

    GhostwriterAgent::assertPrompted(
        fn ($prompt) => str_contains($prompt->prompt, 'Amina Benali (Professeur principal)')
            && str_contains($prompt->prompt, "Cordialement,\n\nAmina Benali\nProfesseur principal")
    );
});

it('falls back to the demandeur as signer when the classe has no professeur principal', function () {
    $demandeur = User::factory()->direction()->create(['prenom' => 'Karim', 'nom' => 'Idrissi']);

    $eleve = Eleve::factory()->create();

    $synthese = SyntheseIA::create([
        'trimestre' => 'T1',
        'statut' => 'en_attente',
        'id_eleve' => $eleve->id_eleve,
        'id_utilisateur_demandeur' => $demandeur->id,
    ]);

    GhostwriterAgent::fake([
        [
            'niveau_alerte' => 'faible',
            'facteurs_risque' => [],
            'signaux_textuels' => [],
            'recommandations' => [],
            'message_parent' => '...',
        ],
    ]);

    (new GenererSyntheseIA($synthese))->handle();

    GhostwriterAgent::assertPrompted(
        fn ($prompt) => str_contains($prompt->prompt, 'Karim Idrissi (Enseignant)')
            && str_contains($prompt->prompt, "Cordialement,\n\nKarim Idrissi\nEnseignant")
    );
});

it('dispatches the job to the queue', function () {
    Queue::fake();

    $eleve = Eleve::factory()->create();

    $synthese = SyntheseIA::create([
        'trimestre' => 'T1',
        'statut' => 'en_attente',
        'id_eleve' => $eleve->id_eleve,
        'id_utilisateur_demandeur' => User::factory()->admin()->create()->id,
    ]);

    GenererSyntheseIA::dispatch($synthese);

    Queue::assertPushed(GenererSyntheseIA::class, function ($job) use ($synthese) {
        return $job->synthese->id_synthese === $synthese->id_synthese;
    });
});
