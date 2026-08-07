<?php

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Retard;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->enseignant = User::factory()->enseignant()->create();
    $this->classe = Classe::factory()->create(['id_utilisateur_principal' => $this->enseignant->id]);
    $this->eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);
});

it('rejects unauthenticated access to retards index', function () {
    $response = $this->getJson('/api/retards');

    $response->assertUnauthorized();
});

it('allows the professeur principal to record a retard for their eleve', function () {
    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->postJson('/api/retards', [
            'date_retard' => '2026-01-15',
            'minutes_retard' => 10,
            'id_eleve' => $this->eleve->id_eleve,
        ]);

    $response->assertCreated();

    $this->assertDatabaseHas('retards', [
        'id_eleve' => $this->eleve->id_eleve,
        'id_utilisateur' => $this->enseignant->id,
    ]);
});

it('forbids an enseignant from recording a retard outside their classe', function () {
    $autreEnseignant = User::factory()->enseignant()->create();
    $autreClasse = Classe::factory()->create(['id_utilisateur_principal' => $autreEnseignant->id]);
    $autreEleve = Eleve::factory()->create(['id_classe' => $autreClasse->id_classe]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->postJson('/api/retards', [
            'date_retard' => '2026-01-15',
            'minutes_retard' => 10,
            'id_eleve' => $autreEleve->id_eleve,
        ]);

    $response->assertForbidden();
});

it('validates required fields when creating a retard', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/retards', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['date_retard', 'minutes_retard', 'id_eleve']);
});

it('allows a parent to view a retard for their own child', function () {
    $parent = User::factory()->parent()->create();
    $this->eleve->tuteurs()->attach($parent->id);

    $retard = Retard::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($parent, 'sanctum')
        ->getJson("/api/retards/{$retard->id_retard}");

    $response->assertOk();
});

it('forbids a parent from viewing a retard outside their perimeter', function () {
    $parent = User::factory()->parent()->create();

    $retard = Retard::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($parent, 'sanctum')
        ->getJson("/api/retards/{$retard->id_retard}");

    $response->assertForbidden();
});

it('lists retards for an authenticated user', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/retards');

    $response->assertOk();
});

it('allows the professeur principal to update a retard for their eleve', function () {
    $retard = Retard::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->putJson("/api/retards/{$retard->id_retard}", [
            'date_retard' => '2026-02-15',
            'minutes_retard' => 20,
            'id_eleve' => $this->eleve->id_eleve,
        ]);

    $response->assertOk()
        ->assertJsonPath('id_retard', $retard->id_retard);
});

it('forbids an enseignant from updating a retard outside their classe', function () {
    $autreEnseignant = User::factory()->enseignant()->create();
    $autreClasse = Classe::factory()->create(['id_utilisateur_principal' => $autreEnseignant->id]);
    $autreEleve = Eleve::factory()->create(['id_classe' => $autreClasse->id_classe]);
    $retard = Retard::factory()->create([
        'id_eleve' => $autreEleve->id_eleve,
        'id_utilisateur' => $autreEnseignant->id,
    ]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->putJson("/api/retards/{$retard->id_retard}", [
            'date_retard' => '2026-02-15',
            'minutes_retard' => 20,
            'id_eleve' => $autreEleve->id_eleve,
        ]);

    $response->assertForbidden();
});

it('forbids a parent from updating a retard', function () {
    $parent = User::factory()->parent()->create();
    $this->eleve->tuteurs()->attach($parent->id);
    $retard = Retard::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($parent, 'sanctum')
        ->putJson("/api/retards/{$retard->id_retard}", [
            'date_retard' => '2026-02-15',
            'minutes_retard' => 20,
            'id_eleve' => $this->eleve->id_eleve,
        ]);

    $response->assertForbidden();
});

it('allows the professeur principal to delete a retard for their eleve', function () {
    $retard = Retard::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->deleteJson("/api/retards/{$retard->id_retard}");

    $response->assertNoContent();
    $this->assertSoftDeleted('retards', ['id_retard' => $retard->id_retard]);
});

it('forbids an enseignant from deleting a retard outside their classe', function () {
    $autreEnseignant = User::factory()->enseignant()->create();
    $autreClasse = Classe::factory()->create(['id_utilisateur_principal' => $autreEnseignant->id]);
    $autreEleve = Eleve::factory()->create(['id_classe' => $autreClasse->id_classe]);
    $retard = Retard::factory()->create([
        'id_eleve' => $autreEleve->id_eleve,
        'id_utilisateur' => $autreEnseignant->id,
    ]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->deleteJson("/api/retards/{$retard->id_retard}");

    $response->assertForbidden();
});

it('forbids a parent from deleting a retard', function () {
    $parent = User::factory()->parent()->create();
    $this->eleve->tuteurs()->attach($parent->id);
    $retard = Retard::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($parent, 'sanctum')
        ->deleteJson("/api/retards/{$retard->id_retard}");

    $response->assertForbidden();
});

it('blocks a duplicate retard for the same eleve and date', function () {
    $this->actingAs($this->enseignant, 'sanctum')
        ->postJson('/api/retards', [
            'date_retard' => '2026-01-15',
            'minutes_retard' => 10,
            'id_eleve' => $this->eleve->id_eleve,
        ])
        ->assertCreated();

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->postJson('/api/retards', [
            'date_retard' => '2026-01-15',
            'minutes_retard' => 5,
            'id_eleve' => $this->eleve->id_eleve,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('date_retard');

    $this->assertDatabaseCount('retards', 1);
});
