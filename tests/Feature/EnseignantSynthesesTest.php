<?php

use App\Models\User;

it('renders the enseignant syntheses page', function () {
    $enseignant = User::factory()->enseignant()->create();

    $this->actingAs($enseignant)
        ->get('/dashboard/enseignant/syntheses')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/enseignant/syntheses'));
});

it('serves the enseignant syntheses page as an SPA shell to unauthenticated requests', function () {
    $this->get('/dashboard/enseignant/syntheses')->assertOk();
});
