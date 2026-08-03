import { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import StatCard from '@/components/ui/StatCard';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type Notification = {
    id_notification: number;
    titre: string;
    message: string;
    statut_envoi: 'envoye' | 'echec' | 'en_attente';
    envoye_le: string | null;
    lu: boolean;
    created_at: string;
};

type Child = {
    id_eleve: number;
    nom: string;
    prenom: string;
    id_classe: number;
    classe: { id_classe: number; nom: string; niveau: string } | null;
};

const STATUT_LABELS: Record<Notification['statut_envoi'], string> = {
    envoye: 'Envoyée',
    echec: 'Échec',
    en_attente: 'En attente',
};

const TITRE_PREFIX = 'Concernant la scolarité de ';

function studentName(notification: Notification): string {
    return notification.titre.startsWith(TITRE_PREFIX)
        ? notification.titre.slice(TITRE_PREFIX.length)
        : notification.titre;
}

function formatDate(value: string | null | undefined): string {
    if (!value) {
        return 'Non envoyée';
    }

    return new Date(value).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default function ParentDashboard() {
    const user = getAuthUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [readingId, setReadingId] = useState<number | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'parent') {
            window.location.href = '/login';

            return;
        }

        async function load() {
            try {
                const [notifRes, childrenRes] = await Promise.all([
                    apiFetch('/api/notifications'),
                    apiFetch('/api/parent/children'),
                ]);

                const notifData = await notifRes.json();
                const childrenData = await childrenRes.json();

                setNotifications(Array.isArray(notifData) ? notifData : []);
                setChildren(Array.isArray(childrenData) ? childrenData : []);
            } catch {
                setError('Impossible de charger vos communications.');
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    async function marquerLue(notification: Notification) {
        setReadingId(notification.id_notification);
        setError(null);

        try {
            const response = await apiFetch(`/api/notifications/${notification.id_notification}/lue`, {
                method: 'PATCH',
            });

            if (!response.ok) {
                setError("Impossible de marquer la communication comme lue.");

                return;
            }

            setNotifications((prev) =>
                prev.map((n) =>
                    n.id_notification === notification.id_notification ? { ...n, lu: true } : n,
                ),
            );
        } catch {
            setError("Impossible de marquer la communication comme lue.");
        } finally {
            setReadingId(null);
        }
    }

    const unreadCount = notifications.filter((n) => !n.lu).length;
    const latest = notifications[0];
    const latestDate = latest ? latest.envoye_le ?? latest.created_at : null;

    const childLabel =
        children.length === 1
            ? `${children[0].prenom} ${children[0].nom}`
            : children.length > 1
                ? `${children.length} enfants`
                : null;

    const classLabel =
        children.length === 1 && children[0].classe
            ? `${children[0].classe.nom} — ${children[0].classe.niveau}`
            : children.length > 1
                ? [...new Set(children.map((c) => c.classe?.nom).filter(Boolean))].join(', ')
                : null;

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-slate-900 dark:text-slate-100">
                Mes Communications
            </h1>

            {error && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    {error}
                </div>
            )}

            {loading ? (
                <Card>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        {[0, 1, 2].map((i) => (
                            <div key={i}>
                                <Skeleton className="h-3 w-1/3" />
                                <Skeleton className="mt-2 h-5 w-2/3" />
                            </div>
                        ))}
                    </div>
                </Card>
            ) : (
                <>
                    <Card className="mb-8">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Parent</p>
                                <p className="mt-1 text-lg font-medium text-slate-900 dark:text-slate-100">
                                    {user?.prenom} {user?.nom}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Enfant</p>
                                <p className="mt-1 text-lg font-medium text-slate-900 dark:text-slate-100">
                                    {childLabel ?? '—'}
                                </p>
                                {classLabel && (
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {classLabel}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Dernière communication
                                </p>
                                <p className="mt-1 text-lg font-medium text-slate-900 dark:text-slate-100">
                                    {latestDate ? formatDate(latestDate) : '—'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <StatCard label="Total communications" value={String(notifications.length)} />
                        <StatCard label="Non lues" value={String(unreadCount)} />
                        <StatCard label="Classe" value={classLabel ?? '—'} />
                    </div>
                </>
            )}

            {!loading && notifications.length === 0 && (
                <Card className="flex flex-col items-center justify-center py-16 text-center">
                    <svg
                        className="mb-4 h-10 w-10 text-slate-500 dark:text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                        />
                    </svg>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Aucune communication reçue pour le moment.
                    </p>
                </Card>
            )}

            {!loading && notifications.length > 0 && (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <Card key={notification.id_notification}>
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {studentName(notification)}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                        {formatDate(notification.envoye_le ?? notification.created_at)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge tone={notification.lu ? 'default' : 'info'}>
                                        {notification.lu ? 'Lue' : 'Non lue'}
                                    </Badge>
                                    <Badge
                                        tone={
                                            notification.statut_envoi === 'envoye'
                                                ? 'success'
                                                : notification.statut_envoi === 'echec'
                                                    ? 'danger'
                                                    : 'warning'
                                        }
                                    >
                                        {STATUT_LABELS[notification.statut_envoi]}
                                    </Badge>
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-slate-900 dark:text-slate-100">
                                {notification.message}
                            </p>
                            {!notification.lu && (
                                <Button
                                    type="button"
                                    size="sm"
                                    className="mt-4"
                                    disabled={readingId === notification.id_notification}
                                    onClick={() => marquerLue(notification)}
                                >
                                    {readingId === notification.id_notification
                                        ? 'En cours...'
                                        : 'Marquer comme lue'}
                                </Button>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
