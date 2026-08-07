<?php

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->nonAdmin = User::factory()->enseignant()->create();
    $this->classe = Classe::factory()->create();
});

it('archives an eleve via delete and excludes them from the active list', function () {
    $eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);

    $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/eleves/{$eleve->id_eleve}")
        ->assertNoContent();

    $this->assertSoftDeleted('eleves', ['id_eleve' => $eleve->id_eleve]);

    $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/eleves')
        ->assertOk()
        ->assertJsonMissing(['id_eleve' => $eleve->id_eleve]);
});

it('lists only archived eleves in the archives endpoint', function () {
    $archived = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);
    $archived->delete();
    $active = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);

    $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/eleves/archives')
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonFragment(['id_eleve' => $archived->id_eleve])
        ->assertJsonMissing(['id_eleve' => $active->id_eleve]);
});

it('includes the deletion date in the eleves archives response', function () {
    $eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);
    $eleve->delete();

    $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/eleves/archives')
        ->assertOk()
        ->assertJsonStructure([['id_eleve', 'deleted_at']]);
});

it('restores an archived eleve', function () {
    $eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);
    $eleve->delete();

    $this->actingAs($this->admin, 'sanctum')
        ->patchJson("/api/eleves/{$eleve->id_eleve}/restore")
        ->assertOk();

    $this->assertNotSoftDeleted('eleves', ['id_eleve' => $eleve->id_eleve]);
});

it('permanently deletes an archived eleve', function () {
    $eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);
    $eleve->delete();

    $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/eleves/{$eleve->id_eleve}/force")
        ->assertNoContent();

    $this->assertDatabaseMissing('eleves', ['id_eleve' => $eleve->id_eleve]);
});

it('bulk archives eleves', function () {
    $eleves = Eleve::factory()->count(3)->create(['id_classe' => $this->classe->id_classe]);

    $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/eleves/bulk-archive', ['ids' => $eleves->pluck('id_eleve')->all()])
        ->assertNoContent();

    foreach ($eleves as $eleve) {
        $this->assertSoftDeleted('eleves', ['id_eleve' => $eleve->id_eleve]);
    }
});

it('bulk restores archived eleves', function () {
    $eleves = Eleve::factory()->count(3)->create(['id_classe' => $this->classe->id_classe]);
    $eleves->each->delete();

    $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/eleves/bulk-restore', ['ids' => $eleves->pluck('id_eleve')->all()])
        ->assertOk()
        ->assertJsonCount(3);

    foreach ($eleves as $eleve) {
        $this->assertNotSoftDeleted('eleves', ['id_eleve' => $eleve->id_eleve]);
    }
});

it('bulk permanently deletes archived eleves', function () {
    $eleves = Eleve::factory()->count(3)->create(['id_classe' => $this->classe->id_classe]);
    $eleves->each->delete();

    $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/eleves/bulk-force-delete', ['ids' => $eleves->pluck('id_eleve')->all()])
        ->assertNoContent();

    foreach ($eleves as $eleve) {
        $this->assertDatabaseMissing('eleves', ['id_eleve' => $eleve->id_eleve]);
    }
});

it('forbids a non-admin from listing archived eleves', function () {
    $this->actingAs($this->nonAdmin, 'sanctum')
        ->getJson('/api/eleves/archives')
        ->assertForbidden();
});

it('forbids a non-admin from restoring an eleve', function () {
    $eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);
    $eleve->delete();

    $this->actingAs($this->nonAdmin, 'sanctum')
        ->patchJson("/api/eleves/{$eleve->id_eleve}/restore")
        ->assertForbidden();

    $this->assertSoftDeleted('eleves', ['id_eleve' => $eleve->id_eleve]);
});

it('forbids a non-admin from permanently deleting an eleve', function () {
    $eleve = Eleve::factory()->create(['id_classe' => $this->classe->id_classe]);
    $eleve->delete();

    $this->actingAs($this->nonAdmin, 'sanctum')
        ->deleteJson("/api/eleves/{$eleve->id_eleve}/force")
        ->assertForbidden();

    $this->assertSoftDeleted('eleves', ['id_eleve' => $eleve->id_eleve]);
});

it('assigns multiple eleves to a classe by updating only id_classe', function () {
    $target = Classe::factory()->create();
    $eleves = Eleve::factory()->count(3)->create(['id_classe' => $this->classe->id_classe]);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/eleves/bulk-assign-class', [
            'ids' => $eleves->pluck('id_eleve')->all(),
            'id_classe' => $target->id_classe,
        ]);

    $response->assertOk()->assertJsonCount(3);

    foreach ($eleves as $eleve) {
        expect($eleve->fresh()->id_classe)->toBe($target->id_classe);
    }

    expect(Classe::find($this->classe->id_classe)->eleves()->count())->toBe(0);
});

it('forbids assigning eleves to an archived classe', function () {
    $eleves = Eleve::factory()->count(2)->create(['id_classe' => $this->classe->id_classe]);
    $target = Classe::factory()->create();
    $target->delete();

    $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/eleves/bulk-assign-class', [
            'ids' => $eleves->pluck('id_eleve')->all(),
            'id_classe' => $target->id_classe,
        ])
        ->assertNotFound();
});

it('forbids a non-admin from assigning eleves to a classe', function () {
    $target = Classe::factory()->create();
    $eleves = Eleve::factory()->count(2)->create(['id_classe' => $this->classe->id_classe]);

    $this->actingAs($this->nonAdmin, 'sanctum')
        ->postJson('/api/eleves/bulk-assign-class', [
            'ids' => $eleves->pluck('id_eleve')->all(),
            'id_classe' => $target->id_classe,
        ])
        ->assertForbidden();
});

it('rejects a bulk assignment without a target classe', function () {
    $eleves = Eleve::factory()->count(2)->create(['id_classe' => $this->classe->id_classe]);

    $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/eleves/bulk-assign-class', ['ids' => $eleves->pluck('id_eleve')->all()])
        ->assertUnprocessable();
});
