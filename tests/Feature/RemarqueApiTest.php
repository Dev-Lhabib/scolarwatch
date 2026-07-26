<?php

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Remarque;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->enseignant = User::factory()->enseignant()->create();
    $this->classe = Classe::factory()->create(['id_utilisateur_principal' => $this->enseignant->id]);
    $this->eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);
});

it('rejects unauthenticated access to remarques index', function () {
    $response = $this->getJson('/api/remarques');

    $response->assertUnauthorized();
});

it('allows the professeur principal to record a remarque for their eleve', function () {
    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->postJson('/api/remarques', [
            'contenu' => 'Ne participe plus depuis le retour des vacances.',
            'trimestre' => 'T1',
            'date_remarque' => '2026-01-15',
            'id_eleve' => $this->eleve->id_eleve,
        ]);

    $response->assertCreated();

    $this->assertDatabaseHas('remarques', [
        'id_eleve' => $this->eleve->id_eleve,
        'id_utilisateur' => $this->enseignant->id,
    ]);
});

it('forbids an enseignant from recording a remarque outside their classe', function () {
    $autreEnseignant = User::factory()->enseignant()->create();
    $autreClasse = Classe::factory()->create(['id_utilisateur_principal' => $autreEnseignant->id]);
    $autreEleve = Eleve::factory()->create(['id_classe' => $autreClasse->id_classe]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->postJson('/api/remarques', [
            'contenu' => 'Test',
            'trimestre' => 'T1',
            'date_remarque' => '2026-01-15',
            'id_eleve' => $autreEleve->id_eleve,
        ]);

    $response->assertForbidden();
});

it('validates required fields when creating a remarque', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/remarques', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['contenu', 'trimestre', 'date_remarque', 'id_eleve']);
});

it('allows a parent to view a remarque for their own child', function () {
    $parent = User::factory()->parent()->create();
    $this->eleve->tuteurs()->attach($parent->id);

    $remarque = Remarque::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($parent, 'sanctum')
        ->getJson("/api/remarques/{$remarque->id_remarque}");

    $response->assertOk();
});

it('forbids a parent from viewing a remarque outside their perimeter', function () {
    $parent = User::factory()->parent()->create();

    $remarque = Remarque::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($parent, 'sanctum')
        ->getJson("/api/remarques/{$remarque->id_remarque}");

    $response->assertForbidden();
});
