import { useEffect, useMemo, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Checkbox from '@/components/ui/Checkbox';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useRowSelection } from '@/hooks/useRowSelection';
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
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
    const [bulkArchiving, setBulkArchiving] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [currentUserId] = useState(() => getAuthUser()?.id ?? null);

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

    const {
        selected,
        selectedKeys,
        toggleRow,
        toggleAll,
        clear,
        allSelected,
        hasSelection,
    } = useRowSelection(filteredUsers.map((user) => user.id));

    function isProtected(user: User): boolean {
        return user.is_bootstrap_admin || user.id === currentUserId;
    }

    async function handleDelete(user: User) {
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
            setDeleteTarget(null);
        }
    }

    async function handleBulkArchive() {
        if (selectedKeys.length === 0) {
            return;
        }

        setBulkArchiving(true);
        setError(null);

        try {
            const response = await apiFetch('/api/users/bulk-archive', {
                method: 'POST',
                body: JSON.stringify({ ids: selectedKeys }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(
                    data.message ??
                        "Erreur lors de l'archivage des utilisateurs.",
                );

                return;
            }

            setRefreshKey((key) => key + 1);
            clear();
        } catch {
            setError("Une erreur est survenue lors de l'archivage.");
        } finally {
            setBulkArchiving(false);
            setBulkDialogOpen(false);
        }
    }

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
                <div className="flex items-center gap-2">
                    <Button href="/admin/archives" tone="secondary">
                        Archives
                    </Button>
                    <Button href="/admin/users/create">
                        Nouvel utilisateur
                    </Button>
                </div>
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

            {hasSelection && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                    <span>
                        {selectedKeys.length} utilisateur
                        {selectedKeys.length > 1 ? 's' : ''} sélectionné
                        {selectedKeys.length > 1 ? 's' : ''}.
                    </span>
                    <Button
                        type="button"
                        tone="danger"
                        size="sm"
                        onClick={() => setBulkDialogOpen(true)}
                        disabled={bulkArchiving}
                    >
                        Archiver la sélection
                    </Button>
                </div>
            )}

            <Card className="overflow-x-auto p-0">
                <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800">
                            <th className="w-12 px-4 py-3">
                                <Checkbox
                                    checked={allSelected}
                                    aria-label="Tout sélectionner"
                                    onChange={toggleAll}
                                />
                            </th>
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
                                <td className="px-4 py-3">
                                    <Checkbox
                                        checked={selected.has(user.id)}
                                        disabled={isProtected(user)}
                                        title={
                                            isProtected(user)
                                                ? 'Ce compte ne peut pas être archivé.'
                                                : undefined
                                        }
                                        aria-label={`Sélectionner ${user.prenom} ${user.nom}`}
                                        onChange={() => toggleRow(user.id)}
                                    />
                                </td>
                                <td className="px-4 py-3">{user.nom}</td>
                                <td className="px-4 py-3">{user.prenom}</td>
                                <td className="px-4 py-3">{user.username}</td>
                                <td className="px-4 py-3">{user.email}</td>
                                <td className="px-4 py-3">
                                    {ROLE_LABELS[user.role]}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge
                                        tone={
                                            user.is_active
                                                ? 'success'
                                                : 'danger'
                                        }
                                    >
                                        {user.is_active ? 'Actif' : 'Inactif'}
                                    </Badge>
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
                                        onClick={() => setDeleteTarget(user)}
                                        disabled={
                                            isProtected(user) ||
                                            deletingId === user.id
                                        }
                                        title={
                                            isProtected(user)
                                                ? 'Le compte administrateur principal ne peut pas être supprimé.'
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
                                    colSpan={8}
                                    className="px-4 py-6 text-center text-slate-500 dark:text-slate-400"
                                >
                                    Aucun utilisateur trouvé.
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td
                                    colSpan={8}
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
                title="Supprimer l'utilisateur"
                description={
                    deleteTarget != null
                        ? `Êtes-vous sûr de vouloir supprimer l'utilisateur « ${deleteTarget.prenom} ${deleteTarget.nom} » ? L'utilisateur sera déplacé vers les archives et pourra être restauré.`
                        : undefined
                }
                confirmLabel="Supprimer"
                confirmVariant="danger"
                loading={deletingId != null}
                loadingLabel="Suppression..."
                onConfirm={() => {
                    if (deleteTarget != null) {
                        handleDelete(deleteTarget);
                    }
                }}
                onCancel={() => setDeleteTarget(null)}
            />

            <ConfirmDialog
                open={bulkDialogOpen}
                title="Archiver la sélection"
                description={`Êtes-vous sûr de vouloir archiver ${selectedKeys.length} utilisateur${selectedKeys.length > 1 ? 's' : ''} ? Ils seront déplacés vers les archives et pourront être restaurés.`}
                confirmLabel="Archiver"
                confirmVariant="danger"
                loading={bulkArchiving}
                loadingLabel="Archivage..."
                onConfirm={handleBulkArchive}
                onCancel={() => setBulkDialogOpen(false)}
            />
        </AppLayout>
    );
}
