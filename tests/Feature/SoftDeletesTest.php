<?php

use App\Models\Absence;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Matiere;
use App\Models\Note;
use App\Models\Notification;
use App\Models\Remarque;
use App\Models\Retard;
use App\Models\SyntheseIA;
use App\Models\User;

it('soft deletes and restores each business model', function (Closure $factory, string $table, string $key) {
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
    'Matiere' => [
        fn () => Matiere::factory()->create(),
        'matieres',
        'id_matiere',
    ],
    'Eleve' => [
        fn () => Eleve::factory()->create(),
        'eleves',
        'id_eleve',
    ],
    'Note' => [
        fn () => Note::factory()->create(),
        'notes',
        'id_note',
    ],
    'Absence' => [
        fn () => Absence::factory()->create(),
        'absences',
        'id_absence',
    ],
    'Retard' => [
        fn () => Retard::factory()->create(),
        'retards',
        'id_retard',
    ],
    'Remarque' => [
        fn () => Remarque::factory()->create(),
        'remarques',
        'id_remarque',
    ],
    'Notification' => [
        fn () => Notification::factory()->create(),
        'notifications',
        'id_notification',
    ],
    'SyntheseIA' => [
        function () {
            $eleve = Eleve::factory()->create();
            $demandeur = User::factory()->direction()->create();

            return SyntheseIA::create([
                'trimestre' => 'T1',
                'statut' => 'en_attente',
                'id_eleve' => $eleve->id_eleve,
                'id_utilisateur_demandeur' => $demandeur->id,
            ]);
        },
        'syntheses_ia',
        'id_synthese',
    ],
]);
