<?php

namespace App\Http\Controllers;

use App\Models\Notification;

class NotificationController extends Controller
{
    /**
     * Display the notifications addressed to the authenticated user,
     * newest first.
     */
    public function index()
    {
        return response()->json(
            Notification::where('id_utilisateur_destinataire', auth()->id())
                ->latest()
                ->latest('id_notification')
                ->get()
        );
    }

    /**
     * Mark a notification as read. Idempotent: an already-read notification
     * is returned unchanged.
     */
    public function marquerCommeLue(Notification $notification)
    {
        $this->authorize('marquerCommeLue', $notification);

        if (! $notification->lu) {
            $notification->update(['lu' => true]);
        }

        return response()->json($notification);
    }
}
