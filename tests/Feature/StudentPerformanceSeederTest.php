<?php

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\User;

it('seeds a deterministic demo performance history for the first student', function () {
    $this->seed();

    $eleve = Eleve::query()->first();

    // The first student follows the "bonne" profile: notes between 15 and 17.
    $notes = $eleve->notes()->where('trimestre', 'T1')->get();

    expect($notes)->toHaveCount(30);

    $valeurs = $notes->pluck('valeur')->map(fn ($valeur) => (float) $valeur);
    expect($valeurs->every(fn (float $valeur) => $valeur >= 15 && $valeur <= 17))->toBeTrue();

    expect($notes->every(
        fn ($note) => $note->utilisateur->id_matiere === $note->id_matiere,
    ))->toBeTrue();

    expect($eleve->absences()->count())->toBe(2);
    expect($eleve->retards()->count())->toBe(4);
    expect($eleve->remarques()->where('trimestre', 'T1')->count())->toBe(3);
});

it('archives exactly the demo records for the archive interfaces', function () {
    $this->seed();

    expect(User::onlyTrashed()->count())->toBe(2);
    expect(Classe::onlyTrashed()->count())->toBe(2);
    expect(Eleve::onlyTrashed()->count())->toBe(5);
});
