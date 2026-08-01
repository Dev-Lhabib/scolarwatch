<?php

use App\Models\User;

it('renders the admin user creation page', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/admin/users/create')
        ->assertInertia(fn ($page) => $page->component('admin/users/create'));
});
