<?php

use App\Models\User;

it('renders the admin dashboard page', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/dashboard/admin')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/admin'));
});

it('serves the admin dashboard as an SPA shell to unauthenticated requests', function () {
    $this->get('/dashboard/admin')->assertOk();
});
