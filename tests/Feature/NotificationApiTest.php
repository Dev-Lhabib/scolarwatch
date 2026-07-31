<?php

use App\Models\Notification;
use App\Models\User;

beforeEach(function () {
    $this->parent = User::factory()->parent()->create();
    $this->otherParent = User::factory()->parent()->create();
    $this->enseignant = User::factory()->enseignant()->create();
});

it('lists only the authenticated user notifications, newest first', function () {
    $first = Notification::factory()->create([
        'id_utilisateur_destinataire' => $this->parent->id,
    ]);

    $second = Notification::factory()->create([
        'id_utilisateur_destinataire' => $this->parent->id,
    ]);

    Notification::factory()->count(2)->create([
        'id_utilisateur_destinataire' => $this->otherParent->id,
    ]);

    Notification::factory()->create([
        'id_utilisateur_destinataire' => $this->enseignant->id,
    ]);

    $response = $this->actingAs($this->parent, 'sanctum')
        ->getJson('/api/notifications');

    $response->assertOk()
        ->assertJsonCount(2)
        ->assertJsonStructure([
            '*' => [
                'id_notification',
                'titre',
                'message',
                'statut_envoi',
                'envoye_le',
                'lu',
                'id_utilisateur_destinataire',
                'id_synthese',
                'created_at',
                'updated_at',
            ],
        ])
        ->assertJsonPath('0.id_notification', $second->id_notification)
        ->assertJsonPath('1.id_notification', $first->id_notification);
});

it('rejects unauthenticated access to notifications', function () {
    $this->getJson('/api/notifications')->assertUnauthorized();
});

it('returns an empty list when the user has no notifications', function () {
    $this->actingAs($this->otherParent, 'sanctum')
        ->getJson('/api/notifications')
        ->assertOk()
        ->assertExactJson([]);
});

it('marks an own notification as read', function () {
    $notification = Notification::factory()->create([
        'id_utilisateur_destinataire' => $this->parent->id,
        'lu' => false,
    ]);

    $response = $this->actingAs($this->parent, 'sanctum')
        ->patchJson("/api/notifications/{$notification->id_notification}/lue");

    $response->assertOk()
        ->assertJsonPath('id_notification', $notification->id_notification)
        ->assertJsonPath('lu', true);

    $this->assertDatabaseHas('notifications', [
        'id_notification' => $notification->id_notification,
        'lu' => true,
    ]);
});

it('is idempotent when the notification is already read', function () {
    $notification = Notification::factory()->create([
        'id_utilisateur_destinataire' => $this->parent->id,
        'lu' => true,
    ]);

    $response = $this->actingAs($this->parent, 'sanctum')
        ->patchJson("/api/notifications/{$notification->id_notification}/lue");

    $response->assertOk()->assertJsonPath('lu', true);
});

it('forbids a user from reading someone else notification', function () {
    $notification = Notification::factory()->create([
        'id_utilisateur_destinataire' => $this->parent->id,
        'lu' => false,
    ]);

    $response = $this->actingAs($this->otherParent, 'sanctum')
        ->patchJson("/api/notifications/{$notification->id_notification}/lue");

    $response->assertForbidden();

    $this->assertDatabaseHas('notifications', [
        'id_notification' => $notification->id_notification,
        'lu' => false,
    ]);
});

it('rejects unauthenticated access to mark as read', function () {
    $notification = Notification::factory()->create([
        'id_utilisateur_destinataire' => $this->parent->id,
    ]);

    $this->patchJson("/api/notifications/{$notification->id_notification}/lue")
        ->assertUnauthorized();
});
