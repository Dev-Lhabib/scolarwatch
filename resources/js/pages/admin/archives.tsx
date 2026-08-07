import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Checkbox from '@/components/ui/Checkbox';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useRowSelection } from '@/hooks/useRowSelection';
import type { RowKey } from '@/hooks/useRowSelection';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type CategoryKey = 'users' | 'eleves' | 'classes';

type ArchivedRow = Record<string, unknown>;

type ColumnConfig = {
    header: string;
    render: (row: ArchivedRow) => ReactNode;
};

type CategoryConfig = {
    label: string;
    labelPlural: string;
    managementHref: string;
    archivesEndpoint: string;
    restoreEndpoint: (id: number) => string;
    forceEndpoint: (id: number) => string;
    bulkRestoreEndpoint: string;
    bulkForceEndpoint: string;
    rowKey: (row: ArchivedRow) => RowKey;
    displayName: (row: ArchivedRow) => string;
    columns: ColumnConfig[];
};

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    enseignant: 'Enseignant',
    direction: 'Direction',
    parent: 'Parent',
};

const CATEGORIES: Record<CategoryKey, CategoryConfig> = {
    users: {
        label: 'Utilisateurs',
        labelPlural: 'utilisateurs',
        managementHref: '/admin/users',
        archivesEndpoint: '/api/users/archives',
        restoreEndpoint: (id) => `/api/users/${id}/restore`,
        forceEndpoint: (id) => `/api/users/${id}/force`,
        bulkRestoreEndpoint: '/api/users/bulk-restore',
        bulkForceEndpoint: '/api/users/bulk-force-delete',
        rowKey: (row) => row.id as number,
        displayName: (row) => `${row.prenom} ${row.nom}`,
        columns: [
            { header: 'Nom', render: (row) => String(row.nom) },
            { header: 'Prénom', render: (row) => String(row.prenom) },
            {
                header: "Nom d'utilisateur",
                render: (row) => String(row.username),
            },
            { header: 'Email', render: (row) => String(row.email) },
            {
                header: 'Rôle',
                render: (row) => (
                    <Badge tone="default">
                        {ROLE_LABELS[String(row.role)] ?? String(row.role)}
                    </Badge>
                ),
            },
        ],
    },
    eleves: {
        label: 'Élèves',
        labelPlural: 'élèves',
        managementHref: '/dashboard/admin/eleves',
        archivesEndpoint: '/api/eleves/archives',
        restoreEndpoint: (id) => `/api/eleves/${id}/restore`,
        forceEndpoint: (id) => `/api/eleves/${id}/force`,
        bulkRestoreEndpoint: '/api/eleves/bulk-restore',
        bulkForceEndpoint: '/api/eleves/bulk-force-delete',
        rowKey: (row) => row.id_eleve as number,
        displayName: (row) => `${row.prenom} ${row.nom}`,
        columns: [
            { header: 'Nom', render: (row) => String(row.nom) },
            { header: 'Prénom', render: (row) => String(row.prenom) },
            {
                header: 'Genre',
                render: (row) => (row.genre === 'M' ? 'Masculin' : 'Féminin'),
            },
            {
                header: 'Date de naissance',
                render: (row) => String(row.date_naissance).slice(0, 10),
            },
            {
                header: 'Code Massar',
                render: (row) => String(row.code_massar ?? '—'),
            },
        ],
    },
    classes: {
        label: 'Classes',
        labelPlural: 'classes',
        managementHref: '/dashboard/admin/classes',
        archivesEndpoint: '/api/classes/archives',
        restoreEndpoint: (id) => `/api/classes/${id}/restore`,
        forceEndpoint: (id) => `/api/classes/${id}/force`,
        bulkRestoreEndpoint: '/api/classes/bulk-restore',
        bulkForceEndpoint: '/api/classes/bulk-force-delete',
        rowKey: (row) => row.id_classe as number,
        displayName: (row) => String(row.nom),
        columns: [
            { header: 'Nom', render: (row) => String(row.nom) },
            { header: 'Niveau', render: (row) => String(row.niveau) },
            {
                header: 'Année',
                render: (row) => String(row.annee_scolaire),
            },
            {
                header: 'Capacité',
                render: (row) => String(row.capacite),
            },
        ],
    },
};

function formatDate(value: unknown): string {
    return value ? new Date(String(value)).toLocaleDateString() : '-';
}

export default function AdminArchives() {
    const [category, setCategory] = useState<CategoryKey | null>(null);
    const [items, setItems] = useState<ArchivedRow[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionId, setActionId] = useState<RowKey | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ArchivedRow | null>(null);
    const [bulkDialog, setBulkDialog] = useState<'restore' | 'force' | null>(
        null,
    );
    const [refreshKey, setRefreshKey] = useState(0);

    const config = category ? CATEGORIES[category] : null;
    const rowKeys = useMemo(
        () => (config ? items.map(config.rowKey) : []),
        [config, items],
    );
    const {
        selected,
        selectedKeys,
        toggleRow,
        toggleAll,
        clear,
        allSelected,
        hasSelection,
    } = useRowSelection(rowKeys);

    useEffect(() => {
        const user = getAuthUser();

        if (!user || user.role !== 'admin') {
            window.location.href = '/login';

            return;
        }
    }, []);

    useEffect(() => {
        if (!category) {
            return;
        }

        apiFetch(CATEGORIES[category].archivesEndpoint)
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    setError(
                        data.message ??
                            'Erreur lors du chargement des archives.',
                    );

                    return;
                }

                setItems(data);
            })
            .catch(() => {
                setError(
                    'Impossible de charger les archives. Vérifiez votre connexion.',
                );
            })
            .finally(() => setLoading(false));
    }, [category, refreshKey]);

    function selectCategory(next: CategoryKey) {
        setCategory(next);
        setSearch('');
        setItems([]);
        setLoading(true);
        clear();
        setError(null);
    }

    async function handleRestore(row: ArchivedRow) {
        if (!config) {
            return;
        }

        setActionId(config.rowKey(row));
        setError(null);

        try {
            const response = await apiFetch(
                config.restoreEndpoint(Number(config.rowKey(row))),
                {
                    method: 'PATCH',
                },
            );

            if (!response.ok) {
                const data = await response.json();
                setError(data.message ?? 'Erreur lors de la restauration.');

                return;
            }

            setRefreshKey((key) => key + 1);
            clear();
        } catch {
            setError('Une erreur est survenue lors de la restauration.');
        } finally {
            setActionId(null);
        }
    }

    async function handleForceDelete(row: ArchivedRow) {
        if (!config) {
            return;
        }

        setActionId(config.rowKey(row));
        setError(null);

        try {
            const response = await apiFetch(
                config.forceEndpoint(Number(config.rowKey(row))),
                {
                    method: 'DELETE',
                },
            );

            if (!response.ok) {
                const data = await response.json();
                setError(data.message ?? 'Erreur lors de la suppression.');

                return;
            }

            setRefreshKey((key) => key + 1);
            clear();
        } catch {
            setError('Une erreur est survenue lors de la suppression.');
        } finally {
            setActionId(null);
            setDeleteTarget(null);
        }
    }

    async function handleBulkRestore() {
        if (!config || selectedKeys.length === 0) {
            return;
        }

        setActionId('bulk');
        setError(null);

        try {
            const response = await apiFetch(config.bulkRestoreEndpoint, {
                method: 'POST',
                body: JSON.stringify({ ids: selectedKeys }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message ?? 'Erreur lors de la restauration.');

                return;
            }

            setRefreshKey((key) => key + 1);
            clear();
        } catch {
            setError('Une erreur est survenue lors de la restauration.');
        } finally {
            setActionId(null);
            setBulkDialog(null);
        }
    }

    async function handleBulkForceDelete() {
        if (!config || selectedKeys.length === 0) {
            return;
        }

        setActionId('bulk');
        setError(null);

        try {
            const response = await apiFetch(config.bulkForceEndpoint, {
                method: 'POST',
                body: JSON.stringify({ ids: selectedKeys }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message ?? 'Erreur lors de la suppression.');

                return;
            }

            setRefreshKey((key) => key + 1);
            clear();
        } catch {
            setError('Une erreur est survenue lors de la suppression.');
        } finally {
            setActionId(null);
            setBulkDialog(null);
        }
    }

    const filteredItems = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return items;
        }

        return items.filter((row) =>
            JSON.stringify(row).toLowerCase().includes(query),
        );
    }, [items, search]);

    const colSpan = (config?.columns.length ?? 0) + 2;

    return (
        <AppLayout>
            <div className="mb-6">
                <h1 className="text-xl font-medium text-slate-900 dark:text-slate-100">
                    Archives
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Consultez et gérez les éléments archivés.
                </p>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
                {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
                    const active = category === key;

                    return (
                        <Button
                            key={key}
                            type="button"
                            tone={active ? 'primary' : 'secondary'}
                            onClick={() => selectCategory(key)}
                        >
                            {CATEGORIES[key].label}
                        </Button>
                    );
                })}
            </div>

            {error && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    {error}
                </div>
            )}

            {!config && (
                <Card className="p-8">
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                        Sélectionnez une catégorie pour consulter les éléments
                        archivés.
                    </p>
                </Card>
            )}

            {config && (
                <>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={`Rechercher ${config.labelPlural} archivé${config.labelPlural.endsWith('s') ? '' : 's'}...`}
                            className="max-w-sm flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                        <Button href={config.managementHref} tone="secondary">
                            Retour à la gestion
                        </Button>
                    </div>

                    {hasSelection && (
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                            <span>
                                {selectedKeys.length} élément
                                {selectedKeys.length > 1 ? 's' : ''} sélectionné
                                {selectedKeys.length > 1 ? 's' : ''}.
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    tone="secondary"
                                    size="sm"
                                    onClick={() => setBulkDialog('restore')}
                                    disabled={actionId != null}
                                >
                                    Restaurer
                                </Button>
                                <Button
                                    type="button"
                                    tone="danger"
                                    size="sm"
                                    onClick={() => setBulkDialog('force')}
                                    disabled={actionId != null}
                                >
                                    Supprimer définitivement
                                </Button>
                            </div>
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
                                    {config.columns.map((column) => (
                                        <th
                                            key={column.header}
                                            className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400"
                                        >
                                            {column.header}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                        Archivé le
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((row) => {
                                    const rowKey = config.rowKey(row);
                                    const busy = actionId === rowKey;

                                    return (
                                        <tr
                                            key={rowKey}
                                            className="border-b border-slate-200 dark:border-slate-800"
                                        >
                                            <td className="px-4 py-3">
                                                <Checkbox
                                                    checked={selected.has(
                                                        rowKey,
                                                    )}
                                                    aria-label={`Sélectionner ${config.displayName(row)}`}
                                                    onChange={() =>
                                                        toggleRow(rowKey)
                                                    }
                                                />
                                            </td>
                                            {config.columns.map((column) => (
                                                <td
                                                    key={column.header}
                                                    className="px-4 py-3"
                                                >
                                                    {column.render(row)}
                                                </td>
                                            ))}
                                            <td className="px-4 py-3">
                                                {formatDate(row.deleted_at)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRestore(row)
                                                    }
                                                    disabled={busy}
                                                    className="mr-4 text-sm font-medium text-indigo-600 hover:underline disabled:opacity-50 dark:text-indigo-400"
                                                >
                                                    {busy
                                                        ? 'Restauration...'
                                                        : 'Restaurer'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleteTarget(row)
                                                    }
                                                    disabled={busy}
                                                    className="text-sm font-medium text-slate-500 hover:text-red-600 disabled:opacity-50 dark:text-slate-400 dark:hover:text-red-400"
                                                >
                                                    Supprimer définitivement
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {!loading && filteredItems.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={colSpan}
                                            className="px-4 py-6 text-center text-slate-500 dark:text-slate-400"
                                        >
                                            Aucun élément archivé.
                                        </td>
                                    </tr>
                                )}
                                {loading && (
                                    <tr>
                                        <td
                                            colSpan={colSpan}
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
                                ? `Êtes-vous sûr de vouloir supprimer définitivement « ${config.displayName(deleteTarget)} » ? Cette action est irréversible.`
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

                    <ConfirmDialog
                        open={bulkDialog === 'restore'}
                        title="Restaurer la sélection"
                        description={`Êtes-vous sûr de vouloir restaurer ${selectedKeys.length} élément${selectedKeys.length > 1 ? 's' : ''} ?`}
                        confirmLabel="Restaurer"
                        loading={actionId === 'bulk'}
                        loadingLabel="Restauration..."
                        onConfirm={handleBulkRestore}
                        onCancel={() => setBulkDialog(null)}
                    />

                    <ConfirmDialog
                        open={bulkDialog === 'force'}
                        title="Supprimer définitivement"
                        description={`Êtes-vous sûr de vouloir supprimer définitivement ${selectedKeys.length} élément${selectedKeys.length > 1 ? 's' : ''} ? Cette action est irréversible.`}
                        confirmLabel="Supprimer définitivement"
                        confirmVariant="danger"
                        loading={actionId === 'bulk'}
                        loadingLabel="Suppression..."
                        onConfirm={handleBulkForceDelete}
                        onCancel={() => setBulkDialog(null)}
                    />
                </>
            )}
        </AppLayout>
    );
}
