<?php

use App\Models\User;

it('renders the enseignant dashboard page', function () {
    $enseignant = User::factory()->enseignant()->create();

    $this->actingAs($enseignant)
        ->get('/dashboard/enseignant')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/enseignant'));
});

it('serves the enseignant dashboard as an SPA shell to unauthenticated requests', function () {
    $this->get('/dashboard/enseignant')->assertOk();
});
