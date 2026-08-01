<?php

use App\Models\User;

it('renders the enseignant classes page', function () {
    $enseignant = User::factory()->enseignant()->create();

    $this->actingAs($enseignant)
        ->get('/dashboard/enseignant/classes')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/enseignant/classes'));
});

it('serves the enseignant classes page as an SPA shell to unauthenticated requests', function () {
    $this->get('/dashboard/enseignant/classes')->assertOk();
});
