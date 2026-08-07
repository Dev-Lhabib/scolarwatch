<?php

use App\Models\User;
use App\Policies\UserPolicy;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->nonAdmin = User::factory()->enseignant()->create();
});

it('soft deletes a user and excludes them from the users list', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/users/{$user->id}");

    $response->assertNoContent();
    $this->assertSoftDeleted('users', ['id' => $user->id]);

    $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/users')
        ->assertOk()
        ->assertJsonMissing(['id' => $user->id]);
});

it('lists only archived users in the archives endpoint', function () {
    $archived = User::factory()->create();
    $archived->delete();
    $active = User::factory()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/users/archives');

    $response->assertOk()
        ->assertJsonCount(1)
        ->assertJsonFragment(['id' => $archived->id])
        ->assertJsonMissing(['id' => $active->id]);
});

it('includes the deletion date in the archives response', function () {
    $user = User::factory()->create();
    $user->delete();

    $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/users/archives')
        ->assertOk()
        ->assertJsonStructure([['id', 'deleted_at']]);
});

it('restores an archived user back to the active users list', function () {
    $user = User::factory()->create();
    $user->delete();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->patchJson("/api/users/{$user->id}/restore");

    $response->assertOk();
    $this->assertNotSoftDeleted('users', ['id' => $user->id]);

    $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/users/archives')
        ->assertOk()
        ->assertJsonMissing(['id' => $user->id]);

    $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/users')
        ->assertOk()
        ->assertJsonFragment(['id' => $user->id]);
});

it('permanently deletes an archived user', function () {
    $user = User::factory()->create();
    $user->delete();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/users/{$user->id}/force");

    $response->assertNoContent();
    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

it('rejects unauthenticated access to the archives', function () {
    $this->getJson('/api/users/archives')->assertUnauthorized();
});

it('forbids a non-admin from listing archives', function () {
    $this->actingAs($this->nonAdmin, 'sanctum')
        ->getJson('/api/users/archives')
        ->assertForbidden();
});

it('forbids a non-admin from restoring a user', function () {
    $user = User::factory()->create();
    $user->delete();

    $this->actingAs($this->nonAdmin, 'sanctum')
        ->patchJson("/api/users/{$user->id}/restore")
        ->assertForbidden();

    $this->assertSoftDeleted('users', ['id' => $user->id]);
});

it('forbids a non-admin from permanently deleting a user', function () {
    $user = User::factory()->create();
    $user->delete();

    $this->actingAs($this->nonAdmin, 'sanctum')
        ->deleteJson("/api/users/{$user->id}/force")
        ->assertForbidden();

    $this->assertSoftDeleted('users', ['id' => $user->id]);
});

it('forbids permanently deleting the bootstrap administrator', function () {
    $otherAdmin = User::factory()->admin()->create();

    $this->actingAs($otherAdmin, 'sanctum')
        ->deleteJson("/api/users/{$this->admin->id}/force")
        ->assertForbidden();
});

it('denies an admin from force-deleting themselves', function () {
    $selfAdmin = User::factory()->admin()->create();

    expect((new UserPolicy)->forceDelete($selfAdmin, $selfAdmin)->allowed())->toBeFalse();
});
