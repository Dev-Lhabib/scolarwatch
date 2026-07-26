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
