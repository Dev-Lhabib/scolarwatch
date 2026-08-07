import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Checkbox from '@/components/ui/Checkbox';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useRowSelection } from '@/hooks/useRowSelection';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type Classe = {
    id_classe: number;
    nom: string;
    niveau: string;
    annee_scolaire: string;
    capacite: number;
    professeur_principal?: {
        id: number;
        prenom: string;
        nom: string;
    } | null;
};

export default function AdminClassesIndex() {
    const [classes, setClasses] = useState<Classe[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Classe | null>(null);
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
    const [bulkArchiving, setBulkArchiving] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const user = getAuthUser();

        if (!user || user.role !== 'admin') {
            window.location.href = '/login';

            return;
        }

        apiFetch('/api/classes')
            .then(async (response) => {
                setError(null);
                const data = await response.json();

                if (!response.ok) {
                    setError(
                        data.message ??
                            'Erreur lors du chargement des classes.',
                    );

                    return;
                }

                setClasses(data);
            })
            .catch(() => {
                setError(
                    'Impossible de charger les classes. Vérifiez votre connexion.',
                );
            })
            .finally(() => setLoading(false));
    }, [refreshKey]);

    const filteredClasses = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return classes;
        }

        return classes.filter((classe) =>
            [classe.nom, classe.niveau, classe.annee_scolaire]
                .join(' ')
                .toLowerCase()
                .includes(query),
        );
    }, [classes, search]);

    const {
        selected,
        selectedKeys,
        toggleRow,
        toggleAll,
        clear,
        allSelected,
        hasSelection,
    } = useRowSelection(filteredClasses.map((classe) => classe.id_classe));

    async function handleDelete(classe: Classe) {
        setDeletingId(classe.id_classe);
        setError(null);

        try {
            const response = await apiFetch(
                `/api/classes/${classe.id_classe}`,
                { method: 'DELETE' },
            );

            if (!response.ok) {
                const data = await response.json();
                setError(
                    data.message ??
                        'Erreur lors de la suppression de la classe.',
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
            const response = await apiFetch('/api/classes/bulk-archive', {
                method: 'POST',
                body: JSON.stringify({ ids: selectedKeys }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(
                    data.message ?? "Erreur lors de l'archivage des classes.",
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
                        Gestion des classes
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {classes.length} classe{classes.length > 1 ? 's' : ''}{' '}
                        enregistrée{classes.length > 1 ? 's' : ''}.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button href="/admin/archives" tone="secondary">
                        Archives
                    </Button>
                    <Button href="/dashboard/admin/classes/create">
                        Nouvelle classe
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
                    placeholder="Rechercher une classe..."
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
            </div>

            {hasSelection && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                    <span>
                        {selectedKeys.length} classe
                        {selectedKeys.length > 1 ? 's' : ''} sélectionnée
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
                                Niveau
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Année
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Capacité
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Professeur principal
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClasses.map((classe) => (
                            <tr
                                key={classe.id_classe}
                                className="border-b border-slate-200 dark:border-slate-800"
                            >
                                <td className="px-4 py-3">
                                    <Checkbox
                                        checked={selected.has(classe.id_classe)}
                                        aria-label={`Sélectionner ${classe.nom}`}
                                        onChange={() =>
                                            toggleRow(classe.id_classe)
                                        }
                                    />
                                </td>
                                <td className="px-4 py-3">{classe.nom}</td>
                                <td className="px-4 py-3">{classe.niveau}</td>
                                <td className="px-4 py-3">
                                    {classe.annee_scolaire}
                                </td>
                                <td className="px-4 py-3">{classe.capacite}</td>
                                <td className="px-4 py-3">
                                    {classe.professeur_principal
                                        ? `${classe.professeur_principal.prenom} ${classe.professeur_principal.nom}`
                                        : '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <a
                                        href={`/dashboard/admin/classes/${classe.id_classe}`}
                                        className="mr-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                    >
                                        Modifier
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteTarget(classe)}
                                        disabled={
                                            deletingId === classe.id_classe
                                        }
                                        className="text-sm font-medium text-slate-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-red-400"
                                    >
                                        {deletingId === classe.id_classe
                                            ? 'Suppression...'
                                            : 'Supprimer'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && filteredClasses.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-6 text-center text-slate-500 dark:text-slate-400"
                                >
                                    Aucune classe trouvée.
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
                title="Supprimer la classe"
                description={
                    deleteTarget != null
                        ? `Êtes-vous sûr de vouloir supprimer la classe « ${deleteTarget.nom} » ? La classe sera déplacée vers les archives et pourra être restaurée.`
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
                description={`Êtes-vous sûr de vouloir archiver ${selectedKeys.length} classe${selectedKeys.length > 1 ? 's' : ''} ? Elles seront déplacées vers les archives et pourront être restaurées.`}
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
