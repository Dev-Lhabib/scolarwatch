<?php

use App\Models\User;

it('renders the parent dashboard page', function () {
    $parent = User::factory()->parent()->create();

    $this->actingAs($parent)
        ->get('/dashboard/parent')
        ->assertInertia(fn ($page) => $page->component('dashboard/parent'));
});
