<?php

use App\Models\Classe;
use App\Models\User;

it('renders the admin classes index page', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/dashboard/admin/classes')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/classes/index'));
});

it('renders the admin classe create page', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/dashboard/admin/classes/create')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/classes/create'));
});

it('renders the admin classe edit page', function () {
    $admin = User::factory()->admin()->create();
    $classe = Classe::factory()->create();

    $this->actingAs($admin)
        ->get("/dashboard/admin/classes/{$classe->id_classe}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/classes/edit'));
});

it('serves the classes pages as an SPA shell to unauthenticated requests', function () {
    $classe = Classe::factory()->create();

    $this->get('/dashboard/admin/classes')->assertOk();
    $this->get('/dashboard/admin/classes/create')->assertOk();
    $this->get("/dashboard/admin/classes/{$classe->id_classe}")->assertOk();
});
