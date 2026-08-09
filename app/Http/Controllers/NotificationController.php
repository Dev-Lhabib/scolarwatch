<?php

namespace App\Http\Controllers;

use App\Models\Notification;

/**
 * Notifications adressées aux utilisateurs.
 *
 * @group Notifications
 */
class NotificationController extends Controller
{
    /**
     * Display the notifications addressed to the authenticated user,
     * newest first.
     *
     * @response [
     *  {
     *      "id_notification": 5,
     *      "titre": "Concernant la scolarité de Léa Bernard",
     *      "message": "Léa rencontre des difficultés...",
     *      "statut_envoi": "envoye",
     *      "envoye_le": "2025-11-03T09:00:00.000000Z",
     *      "lu": false,
     *      "id_utilisateur_destinataire": 6,
     *      "id_synthese": 2,
     *      "created_at": "2025-11-03T09:00:00.000000Z",
     *      "updated_at": "2025-11-03T09:00:00.000000Z"
     *  }
     * ]
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
     *
     * @urlParam notification integer required L'ID de la notification. Example: 5
     *
     * @response {
     *  "id_notification": 5,
     *  "titre": "Concernant la scolarité de Léa Bernard",
     *  "message": "Léa rencontre des difficultés...",
     *  "statut_envoi": "envoye",
     *  "envoye_le": "2025-11-03T09:00:00.000000Z",
     *  "lu": true,
     *  "id_utilisateur_destinataire": 6,
     *  "id_synthese": 2,
     *  "created_at": "2025-11-03T09:00:00.000000Z",
     *  "updated_at": "2025-11-04T08:00:00.000000Z"
     * }
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
