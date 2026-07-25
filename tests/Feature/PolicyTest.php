<?php

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\User;

it('allows a parent to view their own child', function () {
    $parent = User::factory()->parent()->create();
    $eleve = Eleve::factory()->create();
    $eleve->tuteurs()->attach($parent->id);

    expect($parent->can('view', $eleve))->toBeTrue();
});

it('forbids a parent from viewing an eleve outside their perimeter', function () {
    $parent = User::factory()->parent()->create();
    $eleve = Eleve::factory()->create();

    expect($parent->can('view', $eleve))->toBeFalse();
});

it('allows the professeur principal to view an eleve in their class', function () {
    $enseignant = User::factory()->enseignant()->create();
    $classe = Classe::factory()->create(['id_utilisateur_principal' => $enseignant->id]);
    $eleve = Eleve::factory()->create(['id_classe' => $classe->id_classe]);

    expect($enseignant->can('view', $eleve))->toBeTrue();
});

it('forbids an enseignant from viewing an eleve in a class they do not lead', function () {
    $enseignant = User::factory()->enseignant()->create();
    $autreEnseignant = User::factory()->enseignant()->create();
    $classe = Classe::factory()->create(['id_utilisateur_principal' => $autreEnseignant->id]);
    $eleve = Eleve::factory()->create(['id_classe' => $classe->id_classe]);

    expect($enseignant->can('view', $eleve))->toBeFalse();
});

it('allows admin and direction to view any eleve', function () {
    $admin = User::factory()->admin()->create();
    $direction = User::factory()->direction()->create();
    $eleve = Eleve::factory()->create();

    expect($admin->can('view', $eleve))->toBeTrue();
    expect($direction->can('view', $eleve))->toBeTrue();
});

it('only allows admin to create, update, or delete an eleve', function () {
    $admin = User::factory()->admin()->create();
    $direction = User::factory()->direction()->create();
    $eleve = Eleve::factory()->create();

    expect($admin->can('create', Eleve::class))->toBeTrue();
    expect($direction->can('create', Eleve::class))->toBeFalse();
    expect($admin->can('update', $eleve))->toBeTrue();
    expect($direction->can('update', $eleve))->toBeFalse();
    expect($admin->can('delete', $eleve))->toBeTrue();
    expect($direction->can('delete', $eleve))->toBeFalse();
});

it('allows the professeur principal to view their own classe', function () {
    $enseignant = User::factory()->enseignant()->create();
    $classe = Classe::factory()->create(['id_utilisateur_principal' => $enseignant->id]);

    expect($enseignant->can('view', $classe))->toBeTrue();
});

it('forbids an enseignant from viewing a classe they do not lead', function () {
    $enseignant = User::factory()->enseignant()->create();
    $autreEnseignant = User::factory()->enseignant()->create();
    $classe = Classe::factory()->create(['id_utilisateur_principal' => $autreEnseignant->id]);

    expect($enseignant->can('view', $classe))->toBeFalse();
});
