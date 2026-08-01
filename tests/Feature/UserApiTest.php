<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->nonAdmin = User::factory()->enseignant()->create();
});

it('lists users for an admin with correct structure', function () {
    User::factory()->count(3)->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/users');

    $response->assertOk()
        ->assertJsonStructure([
            '*' => [
                'id', 'nom', 'prenom', 'username', 'email', 'telephone', 'adresse',
                'role', 'is_active', 'id_matiere', 'cree_par', 'updated_by',
                'created_at', 'updated_at',
            ],
        ]);
});

it('rejects unauthenticated access to users index', function () {
    $response = $this->getJson('/api/users');

    $response->assertUnauthorized();
});

it('forbids a non-admin from listing users', function () {
    $response = $this->actingAs($this->nonAdmin, 'sanctum')
        ->getJson('/api/users');

    $response->assertForbidden();
});

it('shows a single user to an admin', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson("/api/users/{$user->id}");

    $response->assertOk()
        ->assertJsonFragment(['username' => $user->username]);
});

it('allows a user to view their own profile', function () {
    $response = $this->actingAs($this->nonAdmin, 'sanctum')
        ->getJson("/api/users/{$this->nonAdmin->id}");

    $response->assertOk();
});

it('forbids a non-admin from viewing another user', function () {
    $other = User::factory()->create();

    $response = $this->actingAs($this->nonAdmin, 'sanctum')
        ->getJson("/api/users/{$other->id}");

    $response->assertForbidden();
});

it('allows an admin to update a user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/users/{$user->id}", [
            'nom' => 'Nouveau',
            'prenom' => 'Nom',
            'username' => $user->username,
            'email' => $user->email,
            'role' => 'enseignant',
        ]);

    $response->assertOk()
        ->assertJsonFragment(['nom' => 'Nouveau']);
});

it('allows an admin to update a user password', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/users/{$user->id}", [
            'nom' => $user->nom,
            'prenom' => $user->prenom,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
            'password' => 'newpassword123',
        ])
        ->assertOk();

    $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
});

it('does not overwrite the password when not provided', function () {
    $user = User::factory()->create(['password' => 'oldpassword']);

    $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/users/{$user->id}", [
            'nom' => 'Nouveau',
            'prenom' => 'Nom',
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
        ])
        ->assertOk();

    $this->assertTrue(Hash::check('oldpassword', $user->fresh()->password));
});

it('validates required fields when updating a user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/users/{$user->id}", []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['nom', 'prenom', 'username', 'email', 'role']);
});

it('validates the role when updating a user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/users/{$user->id}", [
            'nom' => 'Nouveau',
            'prenom' => 'Nom',
            'username' => $user->username,
            'email' => $user->email,
            'role' => 'eleve',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['role']);
});

it('forbids a non-admin from updating a user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->nonAdmin, 'sanctum')
        ->putJson("/api/users/{$user->id}", [
            'nom' => 'Nouveau',
            'prenom' => 'Nom',
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
        ]);

    $response->assertForbidden();
});

it('allows an admin to delete a user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/users/{$user->id}");

    $response->assertNoContent();

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

it('forbids an admin from deleting themselves', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/users/{$this->admin->id}");

    $response->assertForbidden();
});

it('forbids a non-admin from deleting a user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->nonAdmin, 'sanctum')
        ->deleteJson("/api/users/{$user->id}");

    $response->assertForbidden();
});
