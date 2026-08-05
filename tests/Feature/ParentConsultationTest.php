<?php

use App\Models\Absence;
use App\Models\Eleve;
use App\Models\Note;
use App\Models\Remarque;
use App\Models\Retard;
use App\Models\User;

dataset('parent consultation endpoints', [
    'notes' => ['url' => '/api/parent/notes', 'model' => Note::class],
    'absences' => ['url' => '/api/parent/absences', 'model' => Absence::class],
    'retards' => ['url' => '/api/parent/retards', 'model' => Retard::class],
    'remarques' => ['url' => '/api/parent/remarques', 'model' => Remarque::class],
]);

it('lists only the records of the parent own children', function (string $url, string $model) {
    $parent = User::factory()->parent()->create();
    $otherParent = User::factory()->parent()->create();

    $child = Eleve::factory()->create();
    $otherChild = Eleve::factory()->create();

    $child->tuteurs()->attach($parent->id);
    $otherChild->tuteurs()->attach($otherParent->id);

    $model::factory()->create(['id_eleve' => $child->id_eleve]);
    $model::factory()->create(['id_eleve' => $otherChild->id_eleve]);

    $this->actingAs($parent, 'sanctum')
        ->getJson($url)
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonPath('0.id_eleve', $child->id_eleve);
})->with('parent consultation endpoints');

it('filters the records by an id_eleve of one of the own children', function (string $url, string $model) {
    $parent = User::factory()->parent()->create();

    $firstChild = Eleve::factory()->create();
    $secondChild = Eleve::factory()->create();

    $parent->eleves()->attach([$firstChild->id_eleve, $secondChild->id_eleve]);

    $model::factory()->create(['id_eleve' => $firstChild->id_eleve]);
    $model::factory()->create(['id_eleve' => $secondChild->id_eleve]);

    $this->actingAs($parent, 'sanctum')
        ->getJson($url.'?id_eleve='.$firstChild->id_eleve)
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonPath('0.id_eleve', $firstChild->id_eleve);
})->with('parent consultation endpoints');

it('forbids filtering on a child of another parent', function (string $url, string $model) {
    $parent = User::factory()->parent()->create();
    $otherParent = User::factory()->parent()->create();

    $otherChild = Eleve::factory()->create();
    $otherChild->tuteurs()->attach($otherParent->id);

    $model::factory()->create(['id_eleve' => $otherChild->id_eleve]);

    $this->actingAs($parent, 'sanctum')
        ->getJson($url.'?id_eleve='.$otherChild->id_eleve)
        ->assertForbidden();
})->with('parent consultation endpoints');

it('forbids filtering on an eleve that does not exist', function (string $url, string $model) {
    $parent = User::factory()->parent()->create();

    $this->actingAs($parent, 'sanctum')
        ->getJson($url.'?id_eleve=999999')
        ->assertForbidden();
})->with('parent consultation endpoints');

it('rejects unauthenticated access to parent consultation endpoints', function (string $url, string $model) {
    $this->getJson($url)->assertUnauthorized();
})->with('parent consultation endpoints');
