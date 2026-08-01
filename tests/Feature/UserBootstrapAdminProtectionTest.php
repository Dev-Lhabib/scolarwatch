<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('forbids deleting the bootstrap administrator', function () {
    $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/users/{$this->admin->id}")
        ->assertForbidden()
        ->assertJsonFragment(['message' => 'Le compte administrateur principal ne peut pas être supprimé.']);

    $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
});

it('forbids deactivating the bootstrap administrator', function (mixed $value) {
    $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/users/{$this->admin->id}", [
            'nom' => $this->admin->nom,
            'prenom' => $this->admin->prenom,
            'username' => $this->admin->username,
            'email' => $this->admin->email,
            'role' => 'admin',
            'is_active' => $value,
        ])
        ->assertForbidden()
        ->assertJsonFragment(['message' => 'Le compte administrateur principal doit rester actif.']);

    expect($this->admin->fresh()->is_active)->toBeTrue();
})->with([false, 0, '0']);

it('forbids changing the bootstrap administrator role', function () {
    $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/users/{$this->admin->id}", [
            'nom' => $this->admin->nom,
            'prenom' => $this->admin->prenom,
            'username' => $this->admin->username,
            'email' => $this->admin->email,
            'role' => 'enseignant',
        ])
        ->assertForbidden()
        ->assertJsonFragment(['message' => "Le rôle de l'administrateur principal ne peut pas être modifié."]);

    expect($this->admin->fresh()->role)->toBe('admin');
});

it('forbids creating an additional administrator account', function () {
    $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/users', [
            'nom' => 'Autre',
            'prenom' => 'Admin',
            'username' => 'admin2',
            'email' => 'admin2@example.com',
            'password' => 'password123',
            'role' => 'admin',
        ])
        ->assertForbidden()
        ->assertJsonFragment(['message' => "La création d'un nouvel administrateur est interdite."]);

    expect(User::where('role', 'admin')->count())->toBe(1);
});

it('allows the bootstrap administrator to update their personal information', function () {
    $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/users/{$this->admin->id}", [
            'nom' => 'Nouveau',
            'prenom' => 'Nom',
            'username' => 'admin_renomme',
            'email' => 'admin.renomme@example.com',
            'telephone' => '0123456789',
            'adresse' => '1 rue de la Test',
            'password' => 'nouveaumotdepasse',
            'role' => 'admin',
            'is_active' => true,
        ])
        ->assertOk();

    $this->assertDatabaseHas('users', [
        'id' => $this->admin->id,
        'nom' => 'Nouveau',
        'prenom' => 'Nom',
        'username' => 'admin_renomme',
        'email' => 'admin.renomme@example.com',
        'telephone' => '0123456789',
        'adresse' => '1 rue de la Test',
        'role' => 'admin',
        'is_active' => true,
    ]);

    expect(Hash::check('nouveaumotdepasse', $this->admin->fresh()->password))->toBeTrue();
});

it('exposes the bootstrap administrator flag for the seeded account', function () {
    $this->actingAs($this->admin, 'sanctum')
        ->getJson("/api/users/{$this->admin->id}")
        ->assertOk()
        ->assertJsonPath('is_bootstrap_admin', true);
});

it('does not flag regular users as bootstrap administrators', function () {
    $regular = User::factory()->create();

    $this->actingAs($this->admin, 'sanctum')
        ->getJson("/api/users/{$regular->id}")
        ->assertOk()
        ->assertJsonPath('is_bootstrap_admin', false);
});
