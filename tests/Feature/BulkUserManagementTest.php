<?php

use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->nonAdmin = User::factory()->enseignant()->create();
});

it('bulk archives multiple users', function () {
    $users = User::factory()->count(3)->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/users/bulk-archive', ['ids' => $users->pluck('id')->all()]);

    $response->assertNoContent();

    foreach ($users as $user) {
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/users')
        ->assertOk()
        ->assertJsonMissing(['id' => $users->first()->id]);
});

it('forbids bulk archiving when the bootstrap administrator is included', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/users/bulk-archive', ['ids' => [$this->admin->id, $user->id]]);

    $response->assertForbidden();
    $this->assertNotSoftDeleted('users', ['id' => $user->id]);
});

it('forbids an admin from bulk archiving themselves', function () {
    $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/users/bulk-archive', ['ids' => [$this->admin->id]])
        ->assertForbidden();
});

it('forbids a non-admin from bulk archiving users', function () {
    $users = User::factory()->count(2)->create();

    $this->actingAs($this->nonAdmin, 'sanctum')
        ->postJson('/api/users/bulk-archive', ['ids' => $users->pluck('id')->all()])
        ->assertForbidden();

    foreach ($users as $user) {
        $this->assertNotSoftDeleted('users', ['id' => $user->id]);
    }
});

it('rejects a bulk archive request without ids', function () {
    $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/users/bulk-archive', ['ids' => []])
        ->assertUnprocessable();
});

it('bulk restores archived users', function () {
    $users = User::factory()->count(3)->create();
    $users->each->delete();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/users/bulk-restore', ['ids' => $users->pluck('id')->all()]);

    $response->assertOk()->assertJsonCount(3);

    foreach ($users as $user) {
        $this->assertNotSoftDeleted('users', ['id' => $user->id]);
    }
});

it('forbids a non-admin from bulk restoring users', function () {
    $user = User::factory()->create();
    $user->delete();

    $this->actingAs($this->nonAdmin, 'sanctum')
        ->postJson('/api/users/bulk-restore', ['ids' => [$user->id]])
        ->assertForbidden();

    $this->assertSoftDeleted('users', ['id' => $user->id]);
});

it('bulk permanently deletes archived users', function () {
    $users = User::factory()->count(3)->create();
    $users->each->delete();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/users/bulk-force-delete', ['ids' => $users->pluck('id')->all()]);

    $response->assertNoContent();

    foreach ($users as $user) {
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }
});

it('forbids a non-admin from bulk permanently deleting users', function () {
    $user = User::factory()->create();
    $user->delete();

    $this->actingAs($this->nonAdmin, 'sanctum')
        ->postJson('/api/users/bulk-force-delete', ['ids' => [$user->id]])
        ->assertForbidden();

    $this->assertSoftDeleted('users', ['id' => $user->id]);
});
