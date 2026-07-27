<?php

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\SyntheseIA;
use App\Models\User;
use App\Notifications\DecrochageAlertNotification;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->enseignant = User::factory()->enseignant()->create();
    $this->classe = Classe::factory()->create(['id_utilisateur_principal' => $this->enseignant->id]);
    $this->eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);

    $this->synthese = SyntheseIA::create([
        'trimestre' => 'T1',
        'statut' => 'traite',
        'niveau_alerte' => 'moyen',
        'message_parent' => 'Nous souhaitons échanger avec vous au sujet de la scolarité de votre enfant.',
        'id_eleve' => $this->eleve->id_eleve,
        'id_utilisateur_demandeur' => $this->enseignant->id,
    ]);
});

it('sends a notification to each tuteur and creates notification records', function () {
    Notification::fake();

    $parent1 = User::factory()->parent()->create();
    $parent2 = User::factory()->parent()->create();
    $this->eleve->tuteurs()->attach([$parent1->id, $parent2->id]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->postJson("/api/syntheses/{$this->synthese->id_synthese}/envoyer");

    $response->assertOk()
        ->assertJsonFragment(['nombre_tuteurs' => 2]);

    Notification::assertSentTo($parent1, DecrochageAlertNotification::class);
    Notification::assertSentTo($parent2, DecrochageAlertNotification::class);

    $this->assertDatabaseHas('notifications', [
        'id_utilisateur_destinataire' => $parent1->id,
        'id_synthese' => $this->synthese->id_synthese,
        'statut_envoi' => 'envoye',
    ]);

    $this->assertDatabaseHas('notifications', [
        'id_utilisateur_destinataire' => $parent2->id,
        'id_synthese' => $this->synthese->id_synthese,
        'statut_envoi' => 'envoye',
    ]);
});

it('returns 422 when the eleve has no tuteurs', function () {
    Notification::fake();

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->postJson("/api/syntheses/{$this->synthese->id_synthese}/envoyer");

    $response->assertStatus(422);

    Notification::assertNothingSent();
});

it('rejects unauthenticated access to the send endpoint', function () {
    $response = $this->postJson("/api/syntheses/{$this->synthese->id_synthese}/envoyer");

    $response->assertUnauthorized();
});

it('forbids an enseignant who is not the professeur principal from sending', function () {
    Notification::fake();

    $autreEnseignant = User::factory()->enseignant()->create();
    $parent = User::factory()->parent()->create();
    $this->eleve->tuteurs()->attach($parent->id);

    $response = $this->actingAs($autreEnseignant, 'sanctum')
        ->postJson("/api/syntheses/{$this->synthese->id_synthese}/envoyer");

    $response->assertForbidden();

    Notification::assertNothingSent();
});

it('allows direction to send the synthese notification', function () {
    Notification::fake();

    $direction = User::factory()->direction()->create();
    $parent = User::factory()->parent()->create();
    $this->eleve->tuteurs()->attach($parent->id);

    $response = $this->actingAs($direction, 'sanctum')
        ->postJson("/api/syntheses/{$this->synthese->id_synthese}/envoyer");

    $response->assertOk();

    Notification::assertSentTo($parent, DecrochageAlertNotification::class);
});
