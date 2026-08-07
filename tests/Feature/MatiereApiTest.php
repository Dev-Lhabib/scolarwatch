<?php

use App\Models\Matiere;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->nonAdmin = User::factory()->enseignant()->create();
});

it('lists matieres for an authenticated user with correct structure', function () {
    Matiere::factory()->count(3)->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/matieres');

    $response->assertOk()
        ->assertJsonStructure([
            '*' => ['id_matiere', 'nom', 'code', 'created_at', 'updated_at'],
        ]);
});

it('rejects unauthenticated access to matieres index', function () {
    $response = $this->getJson('/api/matieres');

    $response->assertUnauthorized();
});

it('allows an admin to create a matiere', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/matieres', [
            'nom' => 'Informatique',
            'code' => 'INFO',
        ]);

    $response->assertCreated()
        ->assertJsonStructure(['id_matiere', 'nom', 'code', 'created_at', 'updated_at']);

    $this->assertDatabaseHas('matieres', ['code' => 'INFO']);
});

it('forbids a non-admin from creating a matiere', function () {
    $response = $this->actingAs($this->nonAdmin, 'sanctum')
        ->postJson('/api/matieres', [
            'nom' => 'Informatique',
            'code' => 'INFO',
        ]);

    $response->assertForbidden();
});

it('validates required fields when creating a matiere', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/matieres', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['nom', 'code']);
});

it('shows a single matiere', function () {
    $matiere = Matiere::factory()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson("/api/matieres/{$matiere->id_matiere}");

    $response->assertOk()
        ->assertJsonFragment(['code' => $matiere->code]);
});

it('allows an admin to update a matiere', function () {
    $matiere = Matiere::factory()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/matieres/{$matiere->id_matiere}", [
            'nom' => 'Nouveau Nom',
            'code' => $matiere->code,
        ]);

    $response->assertOk()
        ->assertJsonFragment(['nom' => 'Nouveau Nom']);
});

it('allows an admin to delete a matiere', function () {
    $matiere = Matiere::factory()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/matieres/{$matiere->id_matiere}");

    $response->assertNoContent();

    $this->assertSoftDeleted('matieres', ['id_matiere' => $matiere->id_matiere]);
});

it('forbids a non-admin from deleting a matiere', function () {
    $matiere = Matiere::factory()->create();

    $response = $this->actingAs($this->nonAdmin, 'sanctum')
        ->deleteJson("/api/matieres/{$matiere->id_matiere}");

    $response->assertForbidden();
});
