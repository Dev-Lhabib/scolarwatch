<?php

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->enseignant = User::factory()->enseignant()->create();
    $this->classe = Classe::factory()->create(['id_utilisateur_principal' => $this->enseignant->id]);
});

it('lists eleves for an authenticated user', function () {
    Eleve::factory()->count(2)->create(['id_classe' => $this->classe->id_classe]);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/eleves');

    $response->assertOk()
        ->assertJsonStructure([
            '*' => ['id_eleve', 'nom', 'prenom', 'genre', 'date_naissance', 'id_classe'],
        ]);
});

it('rejects unauthenticated access to eleves index', function () {
    $response = $this->getJson('/api/eleves');

    $response->assertUnauthorized();
});

it('allows an admin to create an eleve with tuteurs attached', function () {
    $parent = User::factory()->parent()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/eleves', [
            'nom' => 'Test',
            'prenom' => 'Eleve',
            'genre' => 'M',
            'date_naissance' => '2013-05-10',
            'id_classe' => $this->classe->id_classe,
            'tuteur_ids' => [$parent->id],
        ]);

    $response->assertCreated();

    $eleveId = $response->json('id_eleve');

    $this->assertDatabaseHas('eleves', ['id_eleve' => $eleveId]);
    $this->assertDatabaseHas('est_tuteur_de', ['id_eleve' => $eleveId, 'id_utilisateur' => $parent->id]);
});

it('forbids a non-admin from creating an eleve', function () {
    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->postJson('/api/eleves', [
            'nom' => 'Test',
            'prenom' => 'Eleve',
            'genre' => 'M',
            'date_naissance' => '2013-05-10',
            'id_classe' => $this->classe->id_classe,
        ]);

    $response->assertForbidden();
});

it('validates required fields when creating an eleve', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/eleves', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['nom', 'prenom', 'genre', 'date_naissance', 'id_classe']);
});

it('allows the professeur principal to view an eleve in their class', function () {
    $eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->getJson("/api/eleves/{$eleve->id_eleve}");

    $response->assertOk();
});

it('forbids an enseignant from viewing an eleve outside their class', function () {
    $autreEnseignant = User::factory()->enseignant()->create();
    $autreClasse = Classe::factory()->create(['id_utilisateur_principal' => $autreEnseignant->id]);
    $eleve = Eleve::factory()->create(['id_classe' => $autreClasse->id_classe]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->getJson("/api/eleves/{$eleve->id_eleve}");

    $response->assertForbidden();
});

it('allows a parent to view their own child', function () {
    $parent = User::factory()->parent()->create();
    $eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);
    $eleve->tuteurs()->attach($parent->id);

    $response = $this->actingAs($parent, 'sanctum')
        ->getJson("/api/eleves/{$eleve->id_eleve}");

    $response->assertOk();
});

it('forbids a parent from viewing an eleve outside their perimeter', function () {
    $parent = User::factory()->parent()->create();
    $eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);

    $response = $this->actingAs($parent, 'sanctum')
        ->getJson("/api/eleves/{$eleve->id_eleve}");

    $response->assertForbidden();
});

it('replaces tuteurs on update using sync', function () {
    $oldParent = User::factory()->parent()->create();
    $newParent = User::factory()->parent()->create();
    $eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);
    $eleve->tuteurs()->attach($oldParent->id);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/eleves/{$eleve->id_eleve}", [
            'nom' => $eleve->nom,
            'prenom' => $eleve->prenom,
            'genre' => $eleve->genre,
            'date_naissance' => $eleve->date_naissance->format('Y-m-d'),
            'id_classe' => $eleve->id_classe,
            'tuteur_ids' => [$newParent->id],
        ]);

    $response->assertOk();

    $this->assertDatabaseMissing('est_tuteur_de', ['id_eleve' => $eleve->id_eleve, 'id_utilisateur' => $oldParent->id]);
    $this->assertDatabaseHas('est_tuteur_de', ['id_eleve' => $eleve->id_eleve, 'id_utilisateur' => $newParent->id]);
});

it('does not clear tuteurs when tuteur_ids is omitted from update', function () {
    $parent = User::factory()->parent()->create();
    $eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);
    $eleve->tuteurs()->attach($parent->id);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/eleves/{$eleve->id_eleve}", [
            'nom' => 'Nom Modifie',
            'prenom' => $eleve->prenom,
            'genre' => $eleve->genre,
            'date_naissance' => $eleve->date_naissance->format('Y-m-d'),
            'id_classe' => $eleve->id_classe,
        ]);

    $response->assertOk();

    $this->assertDatabaseHas('est_tuteur_de', ['id_eleve' => $eleve->id_eleve, 'id_utilisateur' => $parent->id]);
});

it('allows an admin to delete an eleve', function () {
    $eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/eleves/{$eleve->id_eleve}");

    $response->assertNoContent();

    $this->assertSoftDeleted('eleves', ['id_eleve' => $eleve->id_eleve]);
});

it('forbids a non-admin from deleting an eleve', function () {
    $eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);

    $response = $this->actingAs($this->enseignant, 'sanctum')
        ->deleteJson("/api/eleves/{$eleve->id_eleve}");

    $response->assertForbidden();
});
