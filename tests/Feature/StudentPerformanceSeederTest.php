<?php

use App\Models\Eleve;

it('seeds the T1 performance history for the first student', function () {
    $this->seed();

    $eleve = Eleve::query()->first();

    expect($eleve->notes()->where('trimestre', 'T1')->count())->toBe(8);
    $valeurs = $eleve->notes()
        ->where('trimestre', 'T1')
        ->pluck('valeur')
        ->map(fn ($valeur) => (float) $valeur)
        ->sort()
        ->values()
        ->all();
    expect($valeurs)->toBe([8.0, 9.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0]);

    expect($eleve->absences()->count())->toBe(3);
    expect($eleve->absences()->where('justifiee', true)->count())->toBeGreaterThan(0);
    expect($eleve->absences()->where('justifiee', false)->count())->toBeGreaterThan(0);

    expect($eleve->retards()->count())->toBe(2);
    $minutes = $eleve->retards()->pluck('minutes_retard')->sort()->values()->all();
    expect($minutes)->toBe([10, 20]);

    expect($eleve->remarques()->where('trimestre', 'T1')->count())->toBe(4);
});
