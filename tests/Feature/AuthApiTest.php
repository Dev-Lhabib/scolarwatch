<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('logs in successfully with email', function () {
    $user = User::factory()->create([
        'email' => 'email.login@scolarwatch.test',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'identifiant' => 'email.login@scolarwatch.test',
        'password' => 'password123',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['user', 'token']);
});

it('logs in successfully with username', function () {
    $user = User::factory()->create([
        'username' => 'usernamelogin',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'identifiant' => 'usernamelogin',
        'password' => 'password123',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['user', 'token']);
});

it('rejects login with wrong password', function () {
    User::factory()->create([
        'username' => 'wrongpasstest',
        'password' => Hash::make('correctpassword'),
    ]);

    $response = $this->postJson('/api/login', [
        'identifiant' => 'wrongpasstest',
        'password' => 'incorrectpassword',
    ]);

    $response->assertUnprocessable();
});

it('rejects login for a nonexistent user', function () {
    $response = $this->postJson('/api/login', [
        'identifiant' => 'ghost@scolarwatch.test',
        'password' => 'password123',
    ]);

    $response->assertUnprocessable();
});

it('rejects login for a deactivated account', function () {
    User::factory()->create([
        'username' => 'inactiveuser',
        'password' => Hash::make('password123'),
        'is_active' => false,
    ]);

    $response = $this->postJson('/api/login', [
        'identifiant' => 'inactiveuser',
        'password' => 'password123',
    ]);

    $response->assertUnprocessable();
});

it('rejects account creation attempt by a non-admin', function () {
    $enseignant = User::factory()->enseignant()->create();

    $response = $this->actingAs($enseignant, 'sanctum')
        ->postJson('/api/users', [
            'nom' => 'Test',
            'prenom' => 'User',
            'username' => 'newuser1',
            'email' => 'newuser1@scolarwatch.test',
            'password' => 'password123',
            'role' => 'parent',
        ]);

    $response->assertForbidden();
});

it('allows account creation by an admin', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin, 'sanctum')
        ->postJson('/api/users', [
            'nom' => 'Test',
            'prenom' => 'User',
            'username' => 'newuser2',
            'email' => 'newuser2@scolarwatch.test',
            'password' => 'password123',
            'role' => 'parent',
        ]);

    $response->assertCreated();

    $this->assertDatabaseHas('users', [
        'username' => 'newuser2',
        'cree_par' => $admin->id,
    ]);
});

it('logs out and revokes the current token', function () {
    $user = User::factory()->create([
        'username' => 'logouttest',
        'password' => Hash::make('password123'),
    ]);

    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/logout');

    $response->assertOk();

    $tokenId = explode('|', $token)[0];
    $this->assertDatabaseMissing('personal_access_tokens', ['id' => $tokenId]);
});
