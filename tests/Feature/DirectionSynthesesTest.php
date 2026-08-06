<?php

use App\Models\User;

it('renders the direction syntheses page', function () {
    $direction = User::factory()->direction()->create();

    $this->actingAs($direction)
        ->get('/dashboard/direction/syntheses')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/direction/syntheses'));
});

it('serves the direction syntheses page as an SPA shell to unauthenticated requests', function () {
    $this->get('/dashboard/direction/syntheses')->assertOk();
});
