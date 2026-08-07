<?php

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\User;

it('soft deletes and restores each archiveable model', function (Closure $factory, string $table, string $key) {
    $model = $factory();

    $model->delete();

    expect($model->trashed())->toBeTrue();
    $this->assertSoftDeleted($table, [$key => $model->getKey()]);

    $model->restore();

    expect($model->trashed())->toBeFalse();
    $this->assertNotSoftDeleted($table, [$key => $model->getKey()]);
})->with([
    'User' => [
        fn () => User::factory()->create(),
        'users',
        'id',
    ],
    'Classe' => [
        fn () => Classe::factory()->create(),
        'classes',
        'id_classe',
    ],
    'Eleve' => [
        fn () => Eleve::factory()->create(),
        'eleves',
        'id_eleve',
    ],
]);
