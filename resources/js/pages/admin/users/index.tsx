import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type User = {
    id: number;
    nom: string;
    prenom: string;
    username: string;
    email: string;
    telephone: string | null;
    adresse: string | null;
    role: 'admin' | 'enseignant' | 'direction' | 'parent';
    is_active: boolean;
    is_bootstrap_admin: boolean;
};

const ROLE_LABELS: Record<User['role'], string> = {
    admin: 'Admin',
    enseignant: 'Enseignant',
    direction: 'Direction',
    parent: 'Parent',
};

export default function AdminUsersIndex() {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const user = getAuthUser();

        if (!user || user.role !== 'admin') {
            window.location.href = '/login';

            return;
        }

        apiFetch('/api/users')
            .then(async (response) => {
                setError(null);
                const data = await response.json();

                if (!response.ok) {
                    setError(
                        data.message ??
                            'Erreur lors du chargement des utilisateurs.',
                    );

                    return;
                }

                setUsers(data);
            })
            .catch(() => {
                setError(
                    'Impossible de charger les utilisateurs. Vérifiez votre connexion.',
                );
            })
            .finally(() => setLoading(false));
    }, [refreshKey]);

    async function handleDelete(user: User) {
        if (
            !window.confirm(
                `Supprimer l'utilisateur « ${user.prenom} ${user.nom} » ?`,
            )
        ) {
            return;
        }

        setDeletingId(user.id);
        setError(null);

        try {
            const response = await apiFetch(`/api/users/${user.id}`, {
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
            setDeletingId(null);
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
                        Gestion des utilisateurs
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {users.length} utilisateur{users.length > 1 ? 's' : ''}{' '}
                        enregistré{users.length > 1 ? 's' : ''}.
                    </p>
                </div>
                <a
                    href="/admin/users/create"
                    className="rounded-sm border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:border-indigo-700 hover:bg-indigo-700 dark:border-indigo-500 dark:bg-indigo-500 dark:text-white dark:hover:border-indigo-400 dark:hover:bg-indigo-400"
                >
                    Nouvel utilisateur
                </a>
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
                    placeholder="Rechercher un utilisateur..."
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
            </div>

            <div className="overflow-x-auto rounded-lg bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
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
                                Actif
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
                                    {ROLE_LABELS[user.role]}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`rounded px-2 py-0.5 text-xs font-medium ${user.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}
                                    >
                                        {user.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <a
                                        href={`/admin/users/${user.id}`}
                                        className="mr-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                    >
                                        Modifier
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(user)}
                                        disabled={
                                            user.is_bootstrap_admin ||
                                            deletingId === user.id
                                        }
                                        title={
                                            user.is_bootstrap_admin
                                                ? "Le compte administrateur principal ne peut pas être supprimé."
                                                : undefined
                                        }
                                        className="text-sm font-medium text-slate-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-red-400"
                                    >
                                        {deletingId === user.id
                                            ? 'Suppression...'
                                            : 'Supprimer'}
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
                                    Aucun utilisateur trouvé.
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
            </div>
        </AppLayout>
    );
}
