<?php

use App\Models\Classe;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->enseignant = User::factory()->enseignant()->create();
});

it('lists classes for an authenticated user', function () {
    Classe::factory()->count(2)->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/classes');

    $response->assertOk()
        ->assertJsonStructure([
            '*' => ['id_classe', 'nom', 'niveau', 'annee_scolaire', 'capacite'],
        ]);
});

it('loads the professeur principal and enseignants relations in the classes index', function () {
    $classe = Classe::factory()->create([
        'id_utilisateur_principal' => $this->enseignant->id,
    ]);
    $classe->enseignants()->attach($this->enseignant->id);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/classes');

    $response->assertOk()
        ->assertJsonPath('0.professeur_principal.id', $this->enseignant->id)
        ->assertJsonPath('0.enseignants.0.id', $this->enseignant->id);
});

it('rejects unauthenticated access to classes index', function () {
    $response = $this->getJson('/api/classes');

    $response->assertUnauthorized();
});

it('allows an admin to create a classe', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/classes', [
            'nom' => '2AC-A',
            'niveau' => '2AC',
            'annee_scolaire' => '2025-2026',
            'capacite' => 30,
        ]);

    $response->assertCreated();

    $this->assertDatabaseHas('classes', ['nom' => '2AC-A']);
});

it('forbids a non-admin from creating a classe', function () {
    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->postJson('/api/classes', [
            'nom' => '2AC-A',
            'niveau' => '2AC',
            'annee_scolaire' => '2025-2026',
            'capacite' => 30,
        ]);

    $response->assertForbidden();
});

it('validates required fields when creating a classe', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/classes', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['nom', 'niveau', 'annee_scolaire', 'capacite']);
});

it('rejects a duplicate classe with the same nom and annee_scolaire', function () {
    Classe::factory()->create(['nom' => '1AC-B', 'annee_scolaire' => '2025-2026']);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/classes', [
            'nom' => '1AC-B',
            'niveau' => '1AC',
            'annee_scolaire' => '2025-2026',
            'capacite' => 30,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['nom']);
});

it('allows the same nom in a different annee_scolaire', function () {
    Classe::factory()->create(['nom' => '1AC-B', 'annee_scolaire' => '2025-2026']);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/classes', [
            'nom' => '1AC-B',
            'niveau' => '1AC',
            'annee_scolaire' => '2026-2027',
            'capacite' => 30,
        ]);

    $response->assertCreated();
});

it('rejects an invalid annee_scolaire format', function (string $anneeScolaire) {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/classes', [
            'nom' => 'Test',
            'niveau' => '1AC',
            'annee_scolaire' => $anneeScolaire,
            'capacite' => 30,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['annee_scolaire']);
})->with([
    'ddddd' => ['ddddd'],
    'abc' => ['abc'],
    '2026' => ['2026'],
    'hello' => ['hello'],
    '25-26' => ['25-26'],
    '2025/2026' => ['2025/2026'],
    '2025_2026' => ['2025_2026'],
]);

it('accepts a valid annee_scolaire format', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/classes', [
            'nom' => '1AC-C',
            'niveau' => '1AC',
            'annee_scolaire' => '2026-2027',
            'capacite' => 30,
        ]);

    $response->assertCreated();
});

it('allows updating a classe without changing its own nom and annee_scolaire', function () {
    $classe = Classe::factory()->create(['nom' => '1AC-B', 'annee_scolaire' => '2025-2026']);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/classes/{$classe->id_classe}", [
            'nom' => '1AC-B',
            'niveau' => '1AC',
            'annee_scolaire' => '2025-2026',
            'capacite' => 32,
        ]);

    $response->assertOk();
});

it('rejects updating a classe to an existing nom and annee_scolaire combination', function () {
    Classe::factory()->create(['nom' => '1AC-A', 'annee_scolaire' => '2025-2026']);
    $autreClasse = Classe::factory()->create(['nom' => '1AC-B', 'annee_scolaire' => '2025-2026']);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/classes/{$autreClasse->id_classe}", [
            'nom' => '1AC-A',
            'niveau' => '1AC',
            'annee_scolaire' => '2025-2026',
            'capacite' => 32,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['nom']);
});

it('allows the professeur principal to view their own classe', function () {
    $classe = Classe::factory()->create(['id_utilisateur_principal' => $this->enseignant->id]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->getJson("/api/classes/{$classe->id_classe}");

    $response->assertOk();
});

it('forbids an enseignant from viewing a classe they do not lead', function () {
    $autreEnseignant = User::factory()->enseignant()->create();
    $classe = Classe::factory()->create(['id_utilisateur_principal' => $autreEnseignant->id]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->getJson("/api/classes/{$classe->id_classe}");

    $response->assertForbidden();
});

it('allows an admin to assign a professeur principal', function () {
    $classe = Classe::factory()->create(['id_utilisateur_principal' => null]);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->patchJson("/api/classes/{$classe->id_classe}/professeur-principal", [
            'id_utilisateur_principal' => $this->enseignant->id,
        ]);

    $response->assertOk();

    $this->assertDatabaseHas('classes', [
        'id_classe' => $classe->id_classe,
        'id_utilisateur_principal' => $this->enseignant->id,
    ]);
});

it('allows an admin to assign an enseignant to a classe', function () {
    $classe = Classe::factory()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson("/api/classes/{$classe->id_classe}/enseignants", [
            'id_utilisateur' => $this->enseignant->id,
        ]);

    $response->assertOk();

    $this->assertDatabaseHas('enseigne', [
        'id_classe' => $classe->id_classe,
        'id_utilisateur' => $this->enseignant->id,
    ]);
});

it('does not duplicate an enseignant assignment when called twice', function () {
    $classe = Classe::factory()->create();

    $this->actingAs($this->admin, 'sanctum')
        ->postJson("/api/classes/{$classe->id_classe}/enseignants", ['id_utilisateur' => $this->enseignant->id]);

    $this->actingAs($this->admin, 'sanctum')
        ->postJson("/api/classes/{$classe->id_classe}/enseignants", ['id_utilisateur' => $this->enseignant->id]);

    expect($classe->enseignants()->count())->toBe(1);
});

it('allows an admin to delete a classe', function () {
    $classe = Classe::factory()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/classes/{$classe->id_classe}");

    $response->assertNoContent();

    $this->assertDatabaseMissing('classes', ['id_classe' => $classe->id_classe]);
});

it('forbids a non-admin from deleting a classe', function () {
    $classe = Classe::factory()->create();

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->deleteJson("/api/classes/{$classe->id_classe}");

    $response->assertForbidden();
});
