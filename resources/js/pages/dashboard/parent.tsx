import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type Notification = {
    id_notification: number;
    titre: string;
    message: string;
    statut_envoi: 'envoye' | 'echec' | 'en_attente';
    envoye_le: string | null;
    lu: boolean;
};

const STATUT_LABELS: Record<Notification['statut_envoi'], string> = {
    envoye: 'Envoyée',
    echec: 'Échec',
    en_attente: 'En attente',
};

export default function ParentDashboard() {
    const user = getAuthUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [readingId, setReadingId] = useState<number | null>(null);

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

    useEffect(() => {
        if (!user || user.role !== 'parent') {
            window.location.href = '/login';

            return;
        }

        async function load() {
            try {
                const response = await apiFetch('/api/notifications');
                const data = await response.json();
                setNotifications(Array.isArray(data) ? data : []);
            } catch {
                setError('Impossible de charger vos communications.');
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                Mes Communications
            </h1>

            {error && (
                <div className="mb-4 rounded border border-[#f53003]/30 bg-[#f53003]/10 px-3 py-2 text-sm text-[#f53003] dark:text-[#FF4433]">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                    <div className="h-4 w-1/3 animate-pulse rounded bg-[#e3e3e0] dark:bg-[#3E3E3A]" />
                    <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-[#e3e3e0] dark:bg-[#3E3E3A]" />
                    <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-[#e3e3e0] dark:bg-[#3E3E3A]" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="rounded-lg bg-white p-6 text-center text-sm text-[#706f6c] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:text-[#A1A09A] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                    Aucune communication reçue.
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id_notification}
                            className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]"
                        >
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                    {notification.titre}
                                </span>
                                <span className={`rounded px-2 py-0.5 text-xs ${
                                    notification.lu
                                        ? 'bg-[#e3e3e0]/60 text-[#706f6c] dark:bg-[#3E3E3A]/60 dark:text-[#A1A09A]'
                                        : 'bg-[#f53003]/10 text-[#f53003] dark:bg-[#FF4433]/10 dark:text-[#FF4433]'
                                }`}>
                                    {notification.lu ? 'Lue' : 'Non lue'}
                                </span>
                                <span className={`rounded px-2 py-0.5 text-xs ${
                                    notification.statut_envoi === 'envoye'
                                        ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                        : notification.statut_envoi === 'echec'
                                            ? 'bg-[#f53003]/10 text-[#f53003] dark:text-[#FF4433]'
                                            : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                                }`}>
                                    {STATUT_LABELS[notification.statut_envoi]}
                                </span>
                            </div>
                            <p className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                {notification.message}
                            </p>
                            <p className="mt-3 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                {notification.envoye_le
                                    ? new Date(notification.envoye_le).toLocaleDateString('fr-FR', {
                                          day: 'numeric',
                                          month: 'long',
                                          year: 'numeric',
                                      })
                                    : 'Non envoyée'}
                            </p>
                            {!notification.lu && (
                                <button
                                    type="button"
                                    disabled={readingId === notification.id_notification}
                                    onClick={() => marquerLue(notification)}
                                    className="mt-4 rounded-sm border border-black bg-[#1b1b18] px-3 py-1 text-xs font-medium text-white hover:border-black hover:bg-black disabled:opacity-50 dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                                >
                                    {readingId === notification.id_notification
                                        ? 'En cours...'
                                        : 'Marquer comme lue'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
