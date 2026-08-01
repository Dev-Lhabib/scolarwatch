<?php

use App\Models\User;

it('renders the direction dashboard page', function () {
    $direction = User::factory()->direction()->create();

    $this->actingAs($direction)
        ->get('/dashboard/direction')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/direction'));
});

it('serves the direction dashboard as an SPA shell to unauthenticated requests', function () {
    $this->get('/dashboard/direction')->assertOk();
});
