<?php

use App\Models\Eleve;
use App\Models\User;

it('renders the admin eleves index page', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/dashboard/admin/eleves')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/eleves/index'));
});

it('renders the admin eleve create page', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/dashboard/admin/eleves/create')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/eleves/create'));
});

it('renders the admin eleve edit page', function () {
    $admin = User::factory()->admin()->create();
    $eleve = Eleve::factory()->create();

    $this->actingAs($admin)
        ->get("/dashboard/admin/eleves/{$eleve->id_eleve}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/eleves/edit'));
});

it('serves the eleves pages as an SPA shell to unauthenticated requests', function () {
    $eleve = Eleve::factory()->create();

    $this->get('/dashboard/admin/eleves')->assertOk();
    $this->get('/dashboard/admin/eleves/create')->assertOk();
    $this->get("/dashboard/admin/eleves/{$eleve->id_eleve}")->assertOk();
});
