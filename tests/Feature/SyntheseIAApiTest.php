<?php

use App\Ai\Agents\GhostwriterAgent;
use App\Jobs\GenererSyntheseIA;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\SyntheseIA;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->enseignant = User::factory()->enseignant()->create();
    $this->classe = Classe::factory()->create(['id_utilisateur_principal' => $this->enseignant->id]);
    $this->eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);
});

it('allows the professeur principal to trigger a synthese and returns 202', function () {
    Queue::fake();

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->postJson("/api/eleves/{$this->eleve->id_eleve}/synthese", [
            'trimestre' => 'T1',
        ]);

    $response->assertStatus(202);

    $this->assertDatabaseHas('syntheses_ia', [
        'id_eleve' => $this->eleve->id_eleve,
        'trimestre' => 'T1',
        'statut' => 'en_attente',
    ]);

    Queue::assertPushed(GenererSyntheseIA::class);
});

it('rejects unauthenticated access to synthese creation', function () {
    $response = $this->postJson("/api/eleves/{$this->eleve->id_eleve}/synthese", [
        'trimestre' => 'T1',
    ]);

    $response->assertUnauthorized();
});

it('forbids an enseignant who is not professeur principal from triggering a synthese', function () {
    $autreEnseignant = User::factory()->enseignant()->create();

    $response = $this->actingAs($autreEnseignant, 'sanctum')
        ->postJson("/api/eleves/{$this->eleve->id_eleve}/synthese", [
            'trimestre' => 'T1',
        ]);

    $response->assertForbidden();
});

it('allows direction to trigger a synthese for any eleve', function () {
    Queue::fake();

    $direction = User::factory()->direction()->create();

    $response = $this->actingAs($direction, 'sanctum')
        ->postJson("/api/eleves/{$this->eleve->id_eleve}/synthese", [
            'trimestre' => 'T1',
        ]);

    $response->assertStatus(202);
});

it('returns the synthese status en_attente immediately after creation', function () {
    Queue::fake();

    $this->actingAs($this->enseignant, 'sanctum')
        ->postJson("/api/eleves/{$this->eleve->id_eleve}/synthese", ['trimestre' => 'T1']);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->getJson("/api/eleves/{$this->eleve->id_eleve}/synthese?trimestre=T1");

    $response->assertOk()
        ->assertJsonFragment(['statut' => 'en_attente']);
});

it('returns the completed synthese with results after the job runs', function () {
    GhostwriterAgent::fake([
        [
            'niveau_alerte' => 'moyen',
            'facteurs_risque' => ['Notes en baisse'],
            'signaux_textuels' => ['Semble moins concentré en classe.'],
            'recommandations' => ['Suivi rapproché ce trimestre'],
            'message_parent' => 'Nous vous invitons à échanger avec l\'équipe pédagogique.',
        ],
    ]);

    $synthese = SyntheseIA::create([
        'trimestre' => 'T1',
        'statut' => 'en_attente',
        'id_eleve' => $this->eleve->id_eleve,
        'id_utilisateur_demandeur' => $this->enseignant->id,
    ]);

    (new GenererSyntheseIA($synthese))->handle();

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->getJson("/api/eleves/{$this->eleve->id_eleve}/synthese?trimestre=T1");

    $response->assertOk()
        ->assertJsonFragment(['statut' => 'traite', 'niveau_alerte' => 'moyen']);
});

it('forbids an enseignant from viewing a synthese for an eleve outside their classe', function () {
    $autreEnseignant = User::factory()->enseignant()->create();
    $autreClasse = Classe::factory()->create(['id_utilisateur_principal' => $autreEnseignant->id]);
    $autreEleve = Eleve::factory()->create(['id_classe' => $autreClasse->id_classe]);

    SyntheseIA::create([
        'trimestre' => 'T1',
        'statut' => 'en_attente',
        'id_eleve' => $autreEleve->id_eleve,
        'id_utilisateur_demandeur' => $autreEnseignant->id,
    ]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->getJson("/api/eleves/{$autreEleve->id_eleve}/synthese?trimestre=T1");

    $response->assertForbidden();
});
