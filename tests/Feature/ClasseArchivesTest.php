<?php

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->nonAdmin = User::factory()->enseignant()->create();
});

it('archives a classe via delete and excludes it from the active list', function () {
    $classe = Classe::factory()->create();

    $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/classes/{$classe->id_classe}")
        ->assertNoContent();

    $this->assertSoftDeleted('classes', ['id_classe' => $classe->id_classe]);

    $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/classes')
        ->assertOk()
        ->assertJsonMissing(['id_classe' => $classe->id_classe]);
});

it('lists only archived classes in the archives endpoint', function () {
    $archived = Classe::factory()->create();
    $archived->delete();
    $active = Classe::factory()->create();

    $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/classes/archives')
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonFragment(['id_classe' => $archived->id_classe])
        ->assertJsonMissing(['id_classe' => $active->id_classe]);
});

it('includes the deletion date in the classes archives response', function () {
    $classe = Classe::factory()->create();
    $classe->delete();

    $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/classes/archives')
        ->assertOk()
        ->assertJsonStructure([['id_classe', 'deleted_at']]);
});

it('restores an archived classe', function () {
    $classe = Classe::factory()->create();
    $classe->delete();

    $this->actingAs($this->admin, 'sanctum')
        ->patchJson("/api/classes/{$classe->id_classe}/restore")
        ->assertOk();

    $this->assertNotSoftDeleted('classes', ['id_classe' => $classe->id_classe]);
});

it('permanently deletes an archived classe', function () {
    $classe = Classe::factory()->create();
    $classe->delete();

    $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/classes/{$classe->id_classe}/force")
        ->assertNoContent();

    $this->assertDatabaseMissing('classes', ['id_classe' => $classe->id_classe]);
});

it('bulk archives classes', function () {
    $classes = Classe::factory()->count(3)->create();

    $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/classes/bulk-archive', ['ids' => $classes->pluck('id_classe')->all()])
        ->assertNoContent();

    foreach ($classes as $classe) {
        $this->assertSoftDeleted('classes', ['id_classe' => $classe->id_classe]);
    }
});

it('bulk restores archived classes', function () {
    $classes = Classe::factory()->count(3)->create();
    $classes->each->delete();

    $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/classes/bulk-restore', ['ids' => $classes->pluck('id_classe')->all()])
        ->assertOk()
        ->assertJsonCount(3);

    foreach ($classes as $classe) {
        $this->assertNotSoftDeleted('classes', ['id_classe' => $classe->id_classe]);
    }
});

it('bulk permanently deletes archived classes', function () {
    $classes = Classe::factory()->count(3)->create();
    $classes->each->delete();

    $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/classes/bulk-force-delete', ['ids' => $classes->pluck('id_classe')->all()])
        ->assertNoContent();

    foreach ($classes as $classe) {
        $this->assertDatabaseMissing('classes', ['id_classe' => $classe->id_classe]);
    }
});

it('forbids a non-admin from listing archived classes', function () {
    $this->actingAs($this->nonAdmin, 'sanctum')
        ->getJson('/api/classes/archives')
        ->assertForbidden();
});

it('forbids a non-admin from restoring a classe', function () {
    $classe = Classe::factory()->create();
    $classe->delete();

    $this->actingAs($this->nonAdmin, 'sanctum')
        ->patchJson("/api/classes/{$classe->id_classe}/restore")
        ->assertForbidden();

    $this->assertSoftDeleted('classes', ['id_classe' => $classe->id_classe]);
});

it('forbids a non-admin from permanently deleting a classe', function () {
    $classe = Classe::factory()->create();
    $classe->delete();

    $this->actingAs($this->nonAdmin, 'sanctum')
        ->deleteJson("/api/classes/{$classe->id_classe}/force")
        ->assertForbidden();

    $this->assertSoftDeleted('classes', ['id_classe' => $classe->id_classe]);
});

it('does not archive eleves when their classe is archived', function () {
    $classe = Classe::factory()->create();
    $eleves = Eleve::factory()->count(3)->create(['id_classe' => $classe->id_classe]);

    $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/classes/{$classe->id_classe}")
        ->assertNoContent();

    foreach ($eleves as $eleve) {
        $this->assertNotSoftDeleted('eleves', ['id_eleve' => $eleve->id_eleve]);
        expect($eleve->fresh()->id_classe)->toBe($classe->id_classe);
    }
});
