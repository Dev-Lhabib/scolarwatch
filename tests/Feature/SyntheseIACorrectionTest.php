<?php

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\SyntheseIA;
use App\Models\User;

beforeEach(function () {
    $this->enseignant = User::factory()->enseignant()->create();
    $this->classe = Classe::factory()->create(['id_utilisateur_principal' => $this->enseignant->id]);
    $this->eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);

    $this->synthese = SyntheseIA::create([
        'trimestre' => 'T1',
        'statut' => 'traite',
        'niveau_alerte' => 'moyen',
        'id_eleve' => $this->eleve->id_eleve,
        'id_utilisateur_demandeur' => $this->enseignant->id,
    ]);
});

it('allows the professeur principal to correct the niveau_alerte', function () {
    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->patchJson("/api/syntheses/{$this->synthese->id_synthese}/niveau-alerte", [
            'niveau_alerte_corrige' => 'eleve',
        ]);

    $response->assertOk()
        ->assertJsonFragment(['niveau_alerte_corrige' => 'eleve']);

    $this->synthese->refresh();

    expect($this->synthese->niveau_alerte_corrige)->toBe('eleve');
});

it('never overwrites the original niveau_alerte proposed by the AI', function () {
    $this->actingAs($this->enseignant, 'sanctum')
        ->patchJson("/api/syntheses/{$this->synthese->id_synthese}/niveau-alerte", [
            'niveau_alerte_corrige' => 'faible',
        ]);

    $this->synthese->refresh();

    expect($this->synthese->niveau_alerte)->toBe('moyen');
    expect($this->synthese->niveau_alerte_corrige)->toBe('faible');
});

it('rejects unauthenticated access to the correction endpoint', function () {
    $response = $this->patchJson("/api/syntheses/{$this->synthese->id_synthese}/niveau-alerte", [
        'niveau_alerte_corrige' => 'eleve',
    ]);

    $response->assertUnauthorized();
});

it('forbids an enseignant who is not the professeur principal from correcting', function () {
    $autreEnseignant = User::factory()->enseignant()->create();

    $response = $this->actingAs($autreEnseignant, 'sanctum')
        ->patchJson("/api/syntheses/{$this->synthese->id_synthese}/niveau-alerte", [
            'niveau_alerte_corrige' => 'eleve',
        ]);

    $response->assertForbidden();
});

it('validates the niveau_alerte_corrige value against the allowed enum', function () {
    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->patchJson("/api/syntheses/{$this->synthese->id_synthese}/niveau-alerte", [
            'niveau_alerte_corrige' => 'invalide',
        ]);

    $response->assertUnprocessable();
});

it('allows direction to correct the niveau_alerte', function () {
    $direction = User::factory()->direction()->create();

    $response = $this->actingAs($direction, 'sanctum')
        ->patchJson("/api/syntheses/{$this->synthese->id_synthese}/niveau-alerte", [
            'niveau_alerte_corrige' => 'faible',
        ]);

    $response->assertOk();
});
