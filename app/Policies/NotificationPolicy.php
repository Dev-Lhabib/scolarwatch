<?php

namespace App\Policies;

use App\Models\Notification;
use App\Models\User;

class NotificationPolicy
{
    /**
     * Determine whether the user can mark the notification as read.
     * A notification can only be read by its intended recipient.
     */
    public function marquerCommeLue(User $user, Notification $notification): bool
    {
        return $notification->id_utilisateur_destinataire === $user->id;
    }
}
