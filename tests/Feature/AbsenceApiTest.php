<?php

use App\Models\Absence;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->enseignant = User::factory()->enseignant()->create();
    $this->classe = Classe::factory()->create(['id_utilisateur_principal' => $this->enseignant->id]);
    $this->eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);
});

it('rejects unauthenticated access to absences index', function () {
    $response = $this->getJson('/api/absences');

    $response->assertUnauthorized();
});

it('allows the professeur principal to record an absence for their eleve', function () {
    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->postJson('/api/absences', [
            'date_absence' => '2026-01-15',
            'justifiee' => false,
            'id_eleve' => $this->eleve->id_eleve,
        ]);

    $response->assertCreated();

    $this->assertDatabaseHas('absences', [
        'id_eleve' => $this->eleve->id_eleve,
        'id_utilisateur' => $this->enseignant->id,
    ]);
});

it('forbids an enseignant from recording an absence outside their classe', function () {
    $autreEnseignant = User::factory()->enseignant()->create();
    $autreClasse = Classe::factory()->create(['id_utilisateur_principal' => $autreEnseignant->id]);
    $autreEleve = Eleve::factory()->create(['id_classe' => $autreClasse->id_classe]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->postJson('/api/absences', [
            'date_absence' => '2026-01-15',
            'id_eleve' => $autreEleve->id_eleve,
        ]);

    $response->assertForbidden();
});

it('validates required fields when creating an absence', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/absences', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['date_absence', 'id_eleve']);
});

it('allows a parent to view an absence for their own child', function () {
    $parent = User::factory()->parent()->create();
    $this->eleve->tuteurs()->attach($parent->id);

    $absence = Absence::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($parent, 'sanctum')
        ->getJson("/api/absences/{$absence->id_absence}");

    $response->assertOk();
});

it('forbids a parent from viewing an absence outside their perimeter', function () {
    $parent = User::factory()->parent()->create();

    $absence = Absence::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($parent, 'sanctum')
        ->getJson("/api/absences/{$absence->id_absence}");

    $response->assertForbidden();
});
