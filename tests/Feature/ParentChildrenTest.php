<?php

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\User;

it('returns only the authenticated parent children with their classe', function () {
    $parent = User::factory()->parent()->create();
    $otherParent = User::factory()->parent()->create();
    $enseignant = User::factory()->enseignant()->create();
    $classe = Classe::factory()->create(['id_utilisateur_principal' => $enseignant->id]);

    $child = Eleve::factory()->create(['id_classe' => $classe->id_classe]);
    $otherChild = Eleve::factory()->create(['id_classe' => $classe->id_classe]);

    $child->tuteurs()->attach($parent->id);
    $otherChild->tuteurs()->attach($otherParent->id);

    $response = $this->actingAs($parent, 'sanctum')
        ->getJson('/api/parent/children');

    $response->assertOk()
        ->assertJsonCount(1)
        ->assertJsonStructure([
            '*' => [
                'id_eleve',
                'nom',
                'prenom',
                'id_classe',
                'classe' => ['id_classe', 'nom', 'niveau'],
            ],
        ])
        ->assertJsonPath('0.id_eleve', $child->id_eleve)
        ->assertJsonPath('0.classe.id_classe', $classe->id_classe);
});

it('returns an empty list for a parent without children', function () {
    $parent = User::factory()->parent()->create();

    $this->actingAs($parent, 'sanctum')
        ->getJson('/api/parent/children')
        ->assertOk()
        ->assertExactJson([]);
});

it('rejects unauthenticated access to children', function () {
    $this->getJson('/api/parent/children')->assertUnauthorized();
});
