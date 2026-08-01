<?php

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Matiere;
use App\Models\Note;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->matiere = Matiere::factory()->create();
    $this->enseignant = User::factory()->enseignant()->create(['id_matiere' => $this->matiere->id_matiere]);
    $this->classe = Classe::factory()->create();
    $this->classe->enseignants()->attach($this->enseignant->id);
    $this->eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);
});

it('rejects unauthenticated access to notes index', function () {
    $response = $this->getJson('/api/notes');

    $response->assertUnauthorized();
});

it('allows an enseignant to create a note for their eleve and matiere', function () {
    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->postJson('/api/notes', [
            'valeur' => 15.5,
            'trimestre' => 'T1',
            'date' => '2026-01-15',
            'id_eleve' => $this->eleve->id_eleve,
            'id_matiere' => $this->matiere->id_matiere,
        ]);

    $response->assertCreated();

    $this->assertDatabaseHas('notes', [
        'id_eleve' => $this->eleve->id_eleve,
        'id_matiere' => $this->matiere->id_matiere,
        'id_utilisateur' => $this->enseignant->id,
    ]);
});

it('forbids an enseignant from creating a note when they do not teach the classe', function () {
    $autreClasse = Classe::factory()->create();
    $autreEleve = Eleve::factory()->create(['id_classe' => $autreClasse->id_classe]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->postJson('/api/notes', [
            'valeur' => 15.5,
            'trimestre' => 'T1',
            'date' => '2026-01-15',
            'id_eleve' => $autreEleve->id_eleve,
            'id_matiere' => $this->matiere->id_matiere,
        ]);

    $response->assertForbidden();
});

it('forbids an enseignant from creating a note for a matiere they do not teach', function () {
    $autreMatiere = Matiere::factory()->create();

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->postJson('/api/notes', [
            'valeur' => 15.5,
            'trimestre' => 'T1',
            'date' => '2026-01-15',
            'id_eleve' => $this->eleve->id_eleve,
            'id_matiere' => $autreMatiere->id_matiere,
        ]);

    $response->assertForbidden();
});

it('allows admin to create a note regardless of matiere or classe', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/notes', [
            'valeur' => 12,
            'trimestre' => 'T1',
            'date' => '2026-01-15',
            'id_eleve' => $this->eleve->id_eleve,
            'id_matiere' => $this->matiere->id_matiere,
        ]);

    $response->assertCreated();
});

it('validates required fields when creating a note', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/notes', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['valeur', 'trimestre', 'date', 'id_eleve', 'id_matiere']);
});

it('allows a parent to view a note for their own child', function () {
    $parent = User::factory()->parent()->create();
    $this->eleve->tuteurs()->attach($parent->id);

    $note = Note::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_matiere' => $this->matiere->id_matiere,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($parent, 'sanctum')
        ->getJson("/api/notes/{$note->id_note}");

    $response->assertOk();
});

it('lists notes for an authenticated user', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/notes');

    $response->assertOk();
});

it('allows an admin to update a note', function () {
    $note = Note::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_matiere' => $this->matiere->id_matiere,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/notes/{$note->id_note}", [
            'valeur' => 18,
            'trimestre' => 'T1',
            'date' => '2026-02-15',
            'id_eleve' => $this->eleve->id_eleve,
            'id_matiere' => $this->matiere->id_matiere,
        ]);

    $response->assertOk()
        ->assertJsonPath('id_note', $note->id_note);
});

it('allows an enseignant to update a note for their eleve and matiere', function () {
    $note = Note::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_matiere' => $this->matiere->id_matiere,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->patchJson("/api/notes/{$note->id_note}", [
            'valeur' => 17,
            'trimestre' => 'T1',
            'date' => '2026-02-15',
            'id_eleve' => $this->eleve->id_eleve,
            'id_matiere' => $this->matiere->id_matiere,
        ]);

    $response->assertOk()
        ->assertJsonPath('id_note', $note->id_note);
});

it('forbids an enseignant from updating a note when they do not teach the classe', function () {
    $autreClasse = Classe::factory()->create();
    $autreEleve = Eleve::factory()->create(['id_classe' => $autreClasse->id_classe]);
    $note = Note::factory()->create([
        'id_eleve' => $autreEleve->id_eleve,
        'id_matiere' => $this->matiere->id_matiere,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->putJson("/api/notes/{$note->id_note}", [
            'valeur' => 17,
            'trimestre' => 'T1',
            'date' => '2026-02-15',
            'id_eleve' => $autreEleve->id_eleve,
            'id_matiere' => $this->matiere->id_matiere,
        ]);

    $response->assertForbidden();
});

it('forbids an enseignant from updating a note for a matiere they do not teach', function () {
    $autreMatiere = Matiere::factory()->create();
    $note = Note::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_matiere' => $autreMatiere->id_matiere,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->putJson("/api/notes/{$note->id_note}", [
            'valeur' => 17,
            'trimestre' => 'T1',
            'date' => '2026-02-15',
            'id_eleve' => $this->eleve->id_eleve,
            'id_matiere' => $autreMatiere->id_matiere,
        ]);

    $response->assertForbidden();
});

it('forbids a parent from updating a note', function () {
    $parent = User::factory()->parent()->create();
    $this->eleve->tuteurs()->attach($parent->id);
    $note = Note::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_matiere' => $this->matiere->id_matiere,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($parent, 'sanctum')
        ->putJson("/api/notes/{$note->id_note}", [
            'valeur' => 17,
            'trimestre' => 'T1',
            'date' => '2026-02-15',
            'id_eleve' => $this->eleve->id_eleve,
            'id_matiere' => $this->matiere->id_matiere,
        ]);

    $response->assertForbidden();
});

it('allows an admin to delete a note', function () {
    $note = Note::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_matiere' => $this->matiere->id_matiere,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/notes/{$note->id_note}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('notes', ['id_note' => $note->id_note]);
});

it('allows an enseignant to delete a note for their eleve and matiere', function () {
    $note = Note::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_matiere' => $this->matiere->id_matiere,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->deleteJson("/api/notes/{$note->id_note}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('notes', ['id_note' => $note->id_note]);
});

it('forbids an enseignant from deleting a note outside their classe', function () {
    $autreClasse = Classe::factory()->create();
    $autreEleve = Eleve::factory()->create(['id_classe' => $autreClasse->id_classe]);
    $note = Note::factory()->create([
        'id_eleve' => $autreEleve->id_eleve,
        'id_matiere' => $this->matiere->id_matiere,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->deleteJson("/api/notes/{$note->id_note}");

    $response->assertForbidden();
});

it('forbids a parent from deleting a note', function () {
    $parent = User::factory()->parent()->create();
    $this->eleve->tuteurs()->attach($parent->id);
    $note = Note::factory()->create([
        'id_eleve' => $this->eleve->id_eleve,
        'id_matiere' => $this->matiere->id_matiere,
        'id_utilisateur' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($parent, 'sanctum')
        ->deleteJson("/api/notes/{$note->id_note}");

    $response->assertForbidden();
});
