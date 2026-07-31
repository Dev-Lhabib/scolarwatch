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
                    <h1 className="text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                        Gestion des utilisateurs
                    </h1>
                    <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        {users.length} utilisateur{users.length > 1 ? 's' : ''}{' '}
                        enregistré{users.length > 1 ? 's' : ''}.
                    </p>
                </div>
                <a
                    href="/admin/users/create"
                    className="rounded-sm border border-black bg-[#1b1b18] px-4 py-2 text-sm font-medium text-white hover:border-black hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                >
                    Nouvel utilisateur
                </a>
            </div>

            {error && (
                <div className="mb-4 rounded border border-[#f53003]/30 bg-[#f53003]/10 px-3 py-2 text-sm text-[#f53003] dark:text-[#FF4433]">
                    {error}
                </div>
            )}

            <div className="mb-4 max-w-sm">
                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Rechercher un utilisateur..."
                    className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                />
            </div>

            <div className="overflow-x-auto rounded-lg bg-white shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                <table className="w-full text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                    <thead>
                        <tr className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Nom
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Prénom
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Nom d'utilisateur
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Email
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Rôle
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Actif
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr
                                key={user.id}
                                className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]"
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
                                        className={`rounded px-2 py-0.5 text-xs font-medium ${user.is_active ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-[#f53003]/10 text-[#f53003] dark:text-[#FF4433]'}`}
                                    >
                                        {user.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <a
                                        href={`/admin/users/${user.id}`}
                                        className="mr-4 text-sm font-medium text-[#f53003] hover:underline dark:text-[#FF4433]"
                                    >
                                        Modifier
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(user)}
                                        disabled={deletingId === user.id}
                                        className="text-sm font-medium text-[#706f6c] hover:text-[#f53003] disabled:opacity-50 dark:text-[#A1A09A] dark:hover:text-[#FF4433]"
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
                                    className="px-4 py-6 text-center text-[#706f6c] dark:text-[#A1A09A]"
                                >
                                    Aucun utilisateur trouvé.
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-6 text-center text-[#706f6c] dark:text-[#A1A09A]"
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
