<?php

use App\Models\Matiere;
use App\Models\User;

it('renders the admin matieres index page', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/dashboard/admin/matieres')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/matieres/index'));
});

it('renders the admin matiere create page', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/dashboard/admin/matieres/create')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/matieres/create'));
});

it('renders the admin matiere edit page', function () {
    $admin = User::factory()->admin()->create();
    $matiere = Matiere::factory()->create();

    $this->actingAs($admin)
        ->get("/dashboard/admin/matieres/{$matiere->id_matiere}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/matieres/edit'));
});

it('serves the matieres pages as an SPA shell to unauthenticated requests', function () {
    $matiere = Matiere::factory()->create();

    $this->get('/dashboard/admin/matieres')->assertOk();
    $this->get('/dashboard/admin/matieres/create')->assertOk();
    $this->get("/dashboard/admin/matieres/{$matiere->id_matiere}")->assertOk();
});
