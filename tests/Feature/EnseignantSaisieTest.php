<?php

use App\Models\User;

it('renders the enseignant saisie page', function () {
    $enseignant = User::factory()->enseignant()->create();

    $this->actingAs($enseignant)
        ->get('/dashboard/enseignant/saisie')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/enseignant/saisie'));
});

it('serves the enseignant saisie page as an SPA shell to unauthenticated requests', function () {
    $this->get('/dashboard/enseignant/saisie')->assertOk();
});
