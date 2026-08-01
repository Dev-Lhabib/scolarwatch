<?php

use App\Models\User;

it('renders the admin users index page', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/admin/users')
        ->assertInertia(fn ($page) => $page->component('admin/users/index'));
});

it('renders the admin user edit page', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->get("/admin/users/{$user->id}")
        ->assertInertia(fn ($page) => $page->component('admin/users/edit'));
});
