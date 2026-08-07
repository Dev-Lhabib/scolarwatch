import { useEffect, useMemo, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type ArchivedUser = {
    id: number;
    nom: string;
    prenom: string;
    username: string;
    email: string;
    role: 'admin' | 'enseignant' | 'direction' | 'parent';
    deleted_at: string | null;
};

const ROLE_LABELS: Record<ArchivedUser['role'], string> = {
    admin: 'Admin',
    enseignant: 'Enseignant',
    direction: 'Direction',
    parent: 'Parent',
};

export default function AdminUsersArchives() {
    const [users, setUsers] = useState<ArchivedUser[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionId, setActionId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ArchivedUser | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const user = getAuthUser();

        if (!user || user.role !== 'admin') {
            window.location.href = '/login';

            return;
        }

        apiFetch('/api/users/archives')
            .then(async (response) => {
                setError(null);
                const data = await response.json();

                if (!response.ok) {
                    setError(
                        data.message ??
                            'Erreur lors du chargement des archives.',
                    );

                    return;
                }

                setUsers(data);
            })
            .catch(() => {
                setError(
                    'Impossible de charger les archives. Vérifiez votre connexion.',
                );
            })
            .finally(() => setLoading(false));
    }, [refreshKey]);

    async function handleRestore(user: ArchivedUser) {
        setActionId(user.id);
        setError(null);

        try {
            const response = await apiFetch(`/api/users/${user.id}/restore`, {
                method: 'PATCH',
            });

            if (!response.ok) {
                const data = await response.json();
                setError(
                    data.message ??
                        "Erreur lors de la restauration de l'utilisateur.",
                );

                return;
            }

            setRefreshKey((key) => key + 1);
        } catch {
            setError('Une erreur est survenue lors de la restauration.');
        } finally {
            setActionId(null);
        }
    }

    async function handleForceDelete(user: ArchivedUser) {
        setActionId(user.id);
        setError(null);

        try {
            const response = await apiFetch(`/api/users/${user.id}/force`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                setError(
                    data.message ??
                        "Erreur lors de la suppression de l'utilisateur.",
                );

                return;
            }

            setRefreshKey((key) => key + 1);
        } catch {
            setError('Une erreur est survenue lors de la suppression.');
        } finally {
            setActionId(null);
            setDeleteTarget(null);
        }
    }

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return users;
        }

        return users.filter((user) =>
            [
                user.nom,
                user.prenom,
                user.username,
                user.email,
                ROLE_LABELS[user.role],
            ]
                .join(' ')
                .toLowerCase()
                .includes(query),
        );
    }, [users, search]);

    return (
        <AppLayout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-medium text-slate-900 dark:text-slate-100">
                        Archives des utilisateurs
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {users.length} utilisateur{users.length > 1 ? 's' : ''}{' '}
                        archivé{users.length > 1 ? 's' : ''}.
                    </p>
                </div>
                <Button href="/admin/users" tone="secondary">
                    Retour à la liste
                </Button>
            </div>

            {error && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="mb-4 max-w-sm">
                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Rechercher un utilisateur archivé..."
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
            </div>

            <Card className="overflow-x-auto p-0">
                <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800">
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Nom
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Prénom
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Nom d'utilisateur
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Email
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Rôle
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Archivé le
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr
                                key={user.id}
                                className="border-b border-slate-200 dark:border-slate-800"
                            >
                                <td className="px-4 py-3">{user.nom}</td>
                                <td className="px-4 py-3">{user.prenom}</td>
                                <td className="px-4 py-3">{user.username}</td>
                                <td className="px-4 py-3">{user.email}</td>
                                <td className="px-4 py-3">
                                    <Badge tone="default">
                                        {ROLE_LABELS[user.role]}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    {user.deleted_at
                                        ? new Date(
                                              user.deleted_at,
                                          ).toLocaleDateString()
                                        : '-'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleRestore(user)}
                                        disabled={actionId === user.id}
                                        className="mr-4 text-sm font-medium text-indigo-600 hover:underline disabled:opacity-50 dark:text-indigo-400"
                                    >
                                        {actionId === user.id
                                            ? 'Restauration...'
                                            : 'Restaurer'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteTarget(user)}
                                        disabled={actionId === user.id}
                                        className="text-sm font-medium text-slate-500 hover:text-red-600 disabled:opacity-50 dark:text-slate-400 dark:hover:text-red-400"
                                    >
                                        Supprimer définitivement
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && filteredUsers.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-6 text-center text-slate-500 dark:text-slate-400"
                                >
                                    Aucun utilisateur archivé.
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-6 text-center text-slate-500 dark:text-slate-400"
                                >
                                    Chargement...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            <ConfirmDialog
                open={deleteTarget != null}
                title="Supprimer définitivement"
                description={
                    deleteTarget != null
                        ? `Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur « ${deleteTarget.prenom} ${deleteTarget.nom} » ? Cette action est irréversible.`
                        : undefined
                }
                confirmLabel="Supprimer définitivement"
                confirmVariant="danger"
                loading={actionId != null}
                loadingLabel="Suppression..."
                onConfirm={() => {
                    if (deleteTarget != null) {
                        handleForceDelete(deleteTarget);
                    }
                }}
                onCancel={() => setDeleteTarget(null)}
            />
        </AppLayout>
    );
}
