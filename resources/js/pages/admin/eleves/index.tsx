import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Checkbox from '@/components/ui/Checkbox';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Select from '@/components/ui/Select';
import { useRowSelection } from '@/hooks/useRowSelection';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type Eleve = {
    id_eleve: number;
    nom: string;
    prenom: string;
    genre: string;
    date_naissance: string;
    code_massar: string | null;
    id_classe: number;
};

type Classe = {
    id_classe: number;
    nom: string;
};

type BulkDialog = 'archive' | 'assign' | null;

export default function AdminElevesIndex() {
    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Eleve | null>(null);
    const [bulkDialog, setBulkDialog] = useState<BulkDialog>(null);
    const [bulkBusy, setBulkBusy] = useState(false);
    const [assignTarget, setAssignTarget] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const user = getAuthUser();

        if (!user || user.role !== 'admin') {
            window.location.href = '/login';

            return;
        }

        Promise.all([apiFetch('/api/eleves'), apiFetch('/api/classes')])
            .then(async ([elevesRes, classesRes]) => {
                setError(null);
                const elevesData = await elevesRes.json();

                if (!elevesRes.ok) {
                    setError(
                        elevesData.message ??
                            'Erreur lors du chargement des élèves.',
                    );

                    return;
                }

                const classesData = await classesRes.json();
                setEleves(elevesData);
                setClasses(Array.isArray(classesData) ? classesData : []);
            })
            .catch(() => {
                setError(
                    'Impossible de charger les élèves. Vérifiez votre connexion.',
                );
            })
            .finally(() => setLoading(false));
    }, [refreshKey]);

    const classeMap = useMemo(
        () =>
            Object.fromEntries(
                classes.map((classe) => [classe.id_classe, classe.nom]),
            ),
        [classes],
    );

    const filteredEleves = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return eleves;
        }

        return eleves.filter((eleve) =>
            [eleve.nom, eleve.prenom, eleve.code_massar ?? '']
                .join(' ')
                .toLowerCase()
                .includes(query),
        );
    }, [eleves, search]);

    const {
        selected,
        selectedKeys,
        toggleRow,
        toggleAll,
        clear,
        allSelected,
        hasSelection,
    } = useRowSelection(filteredEleves.map((eleve) => eleve.id_eleve));

    async function handleDelete(eleve: Eleve) {
        setDeletingId(eleve.id_eleve);
        setError(null);

        try {
            const response = await apiFetch(`/api/eleves/${eleve.id_eleve}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                setError(
                    data.message ?? "Erreur lors de la suppression de l'élève.",
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

        setBulkBusy(true);
        setError(null);

        try {
            const response = await apiFetch('/api/eleves/bulk-archive', {
                method: 'POST',
                body: JSON.stringify({ ids: selectedKeys }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(
                    data.message ?? "Erreur lors de l'archivage des élèves.",
                );

                return;
            }

            setRefreshKey((key) => key + 1);
            clear();
        } catch {
            setError("Une erreur est survenue lors de l'archivage.");
        } finally {
            setBulkBusy(false);
            setBulkDialog(null);
        }
    }

    async function handleBulkAssign() {
        if (selectedKeys.length === 0 || !assignTarget) {
            return;
        }

        setBulkBusy(true);
        setError(null);

        try {
            const response = await apiFetch('/api/eleves/bulk-assign-class', {
                method: 'POST',
                body: JSON.stringify({
                    ids: selectedKeys,
                    id_classe: Number(assignTarget),
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(
                    data.message ?? "Erreur lors de l'affectation des élèves.",
                );

                return;
            }

            setRefreshKey((key) => key + 1);
            clear();
        } catch {
            setError("Une erreur est survenue lors de l'affectation.");
        } finally {
            setBulkBusy(false);
            setBulkDialog(null);
            setAssignTarget('');
        }
    }

    return (
        <AppLayout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-medium text-slate-900 dark:text-slate-100">
                        Gestion des élèves
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {eleves.length} élève{eleves.length > 1 ? 's' : ''}{' '}
                        enregistré{eleves.length > 1 ? 's' : ''}.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button href="/admin/archives" tone="secondary">
                        Archives
                    </Button>
                    <Button href="/dashboard/admin/eleves/create">
                        Nouvel élève
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
                    placeholder="Rechercher un élève..."
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
            </div>

            {hasSelection && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                    <span>
                        {selectedKeys.length} élève
                        {selectedKeys.length > 1 ? 's' : ''} sélectionné
                        {selectedKeys.length > 1 ? 's' : ''}.
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={assignTarget}
                            onChange={(event) =>
                                setAssignTarget(event.target.value)
                            }
                            className="w-48"
                            aria-label="Classe de destination"
                        >
                            <option value="">Affecter à la classe...</option>
                            {classes.map((classe) => (
                                <option
                                    key={classe.id_classe}
                                    value={classe.id_classe}
                                >
                                    {classe.nom}
                                </option>
                            ))}
                        </Select>
                        <Button
                            type="button"
                            tone="secondary"
                            size="sm"
                            onClick={() => setBulkDialog('assign')}
                            disabled={!assignTarget || bulkBusy}
                        >
                            Affecter
                        </Button>
                        <Button
                            type="button"
                            tone="danger"
                            size="sm"
                            onClick={() => setBulkDialog('archive')}
                            disabled={bulkBusy}
                        >
                            Archiver la sélection
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
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Nom
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Prénom
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Classe
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Genre
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Date de naissance
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Code Massar
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEleves.map((eleve) => (
                            <tr
                                key={eleve.id_eleve}
                                className="border-b border-slate-200 dark:border-slate-800"
                            >
                                <td className="px-4 py-3">
                                    <Checkbox
                                        checked={selected.has(eleve.id_eleve)}
                                        aria-label={`Sélectionner ${eleve.prenom} ${eleve.nom}`}
                                        onChange={() =>
                                            toggleRow(eleve.id_eleve)
                                        }
                                    />
                                </td>
                                <td className="px-4 py-3">{eleve.nom}</td>
                                <td className="px-4 py-3">{eleve.prenom}</td>
                                <td className="px-4 py-3">
                                    {classeMap[eleve.id_classe] ??
                                        eleve.id_classe}
                                </td>
                                <td className="px-4 py-3">
                                    {eleve.genre === 'M'
                                        ? 'Masculin'
                                        : 'Féminin'}
                                </td>
                                <td className="px-4 py-3">
                                    {String(eleve.date_naissance).slice(0, 10)}
                                </td>
                                <td className="px-4 py-3">
                                    {eleve.code_massar ?? '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <a
                                        href={`/dashboard/admin/eleves/${eleve.id_eleve}`}
                                        className="mr-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                    >
                                        Modifier
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteTarget(eleve)}
                                        disabled={deletingId === eleve.id_eleve}
                                        className="text-sm font-medium text-slate-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-red-400"
                                    >
                                        {deletingId === eleve.id_eleve
                                            ? 'Suppression...'
                                            : 'Supprimer'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && filteredEleves.length === 0 && (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-4 py-6 text-center text-slate-500 dark:text-slate-400"
                                >
                                    Aucun élève trouvé.
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
                title="Supprimer l'élève"
                description={
                    deleteTarget != null
                        ? `Êtes-vous sûr de vouloir supprimer l'élève « ${deleteTarget.prenom} ${deleteTarget.nom} » ? L'élève sera déplacé vers les archives et pourra être restauré.`
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
                open={bulkDialog === 'archive'}
                title="Archiver la sélection"
                description={`Êtes-vous sûr de vouloir archiver ${selectedKeys.length} élève${selectedKeys.length > 1 ? 's' : ''} ? Ils seront déplacés vers les archives et pourront être restaurés.`}
                confirmLabel="Archiver"
                confirmVariant="danger"
                loading={bulkBusy}
                loadingLabel="Archivage..."
                onConfirm={handleBulkArchive}
                onCancel={() => setBulkDialog(null)}
            />

            <ConfirmDialog
                open={bulkDialog === 'assign'}
                title="Affecter les élèves"
                description={`Affecter ${selectedKeys.length} élève${selectedKeys.length > 1 ? 's' : ''} à la classe « ${classeMap[Number(assignTarget)] ?? ''} » ?`}
                confirmLabel="Affecter"
                loading={bulkBusy}
                loadingLabel="Affectation..."
                onConfirm={handleBulkAssign}
                onCancel={() => setBulkDialog(null)}
            />
        </AppLayout>
    );
}
