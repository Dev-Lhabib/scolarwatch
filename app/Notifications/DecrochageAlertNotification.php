<?php

namespace App\Notifications;

use App\Models\SyntheseIA;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DecrochageAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public SyntheseIA $synthese,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $eleve = $this->synthese->eleve;

        return (new MailMessage)
            ->subject("Concernant la scolarité de {$eleve->prenom} {$eleve->nom}")
            ->greeting("Bonjour {$notifiable->prenom},")
            ->line($this->synthese->message_parent)
            ->line('N\'hésitez pas à contacter l\'établissement pour tout complément d\'information.')
            ->salutation('Cordialement, l\'équipe pédagogique');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'id_synthese' => $this->synthese->id_synthese,
            'id_eleve' => $this->synthese->id_eleve,
        ];
    }
}
