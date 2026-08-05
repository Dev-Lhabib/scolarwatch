import { useState } from 'react';
import { Check, Circle, X } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const TITRE_PREFIX = 'Concernant la scolarité de ';

export type ParentNotification = {
    id_notification: number;
    titre: string;
    message: string;
    statut_envoi: 'envoye' | 'echec' | 'en_attente';
    envoye_le: string | null;
    lu: boolean;
    created_at: string;
};

const STATUT_LABELS: Record<ParentNotification['statut_envoi'], string> = {
    envoye: 'Envoyée',
    echec: 'Échec',
    en_attente: 'En attente',
};

type NotificationCardProps = {
    notification: ParentNotification;
    classe?: string | null;
    reading?: boolean;
    onMarquerLue: () => void;
};

export function studentName(notification: ParentNotification): string {
    return notification.titre.startsWith(TITRE_PREFIX)
        ? notification.titre.slice(TITRE_PREFIX.length)
        : notification.titre;
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Non envoyée';
    }

    return new Date(value).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default function NotificationCard({
    notification,
    classe,
    reading = false,
    onMarquerLue,
}: NotificationCardProps) {
    const [expanded, setExpanded] = useState(false);

    const readTone = notification.lu ? 'default' : 'info';
    const sentTone =
        notification.statut_envoi === 'envoye'
            ? 'success'
            : notification.statut_envoi === 'echec'
              ? 'danger'
              : 'warning';

    return (
        <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {notification.titre}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={readTone} className="gap-1">
                        {notification.lu ? (
                            <Check className="h-3 w-3" />
                        ) : (
                            <Circle className="h-2 w-2 fill-current" />
                        )}
                        {notification.lu ? 'Lue' : 'Non lue'}
                    </Badge>
                    <Badge tone={sentTone} className="gap-1">
                        {notification.statut_envoi === 'envoye' ? (
                            <Check className="h-3 w-3" />
                        ) : notification.statut_envoi === 'echec' ? (
                            <X className="h-3 w-3" />
                        ) : (
                            <Circle className="h-2 w-2 fill-current" />
                        )}
                        {STATUT_LABELS[notification.statut_envoi]}
                    </Badge>
                </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span>{studentName(notification)}</span>
                {classe && <span>{classe}</span>}
                <span>
                    {formatDate(
                        notification.envoye_le ?? notification.created_at,
                    )}
                </span>
            </div>

            <p
                className={`mt-3 text-sm whitespace-pre-line text-slate-900 dark:text-slate-100 ${
                    expanded ? '' : 'line-clamp-5'
                }`}
            >
                {notification.message}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4">
                <button
                    type="button"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    onClick={() => setExpanded((value) => !value)}
                >
                    {expanded ? 'Voir moins' : 'Voir plus'}
                </button>
                {!notification.lu && (
                    <Button
                        type="button"
                        size="sm"
                        disabled={reading}
                        onClick={onMarquerLue}
                    >
                        {reading ? 'En cours...' : 'Marquer comme lue'}
                    </Button>
                )}
            </div>
        </Card>
    );
}
