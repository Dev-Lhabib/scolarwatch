import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, ComponentType, ReactNode } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { apiFetch } from '@/lib/auth';

export type Eleve = {
    id_eleve: number;
    nom: string;
    prenom: string;
};

export type Column<T> = {
    header: string;
    align?: 'left' | 'right';
    render: (record: T) => ReactNode;
};

export type StudentColumn<T> = {
    header: string;
    render: (student: Eleve, records: T[]) => ReactNode;
};

export type Context = {
    authUserId: number;
    matiereId?: number | null;
    trimestre?: string;
};

export type FormProps<T> = {
    eleve: Eleve;
    initial?: T | null;
    onSaved: (record: T) => void;
    onCancel: () => void;
};

export type ResourceConfig<T, F extends object = object> = {
    endpoint: string;
    addButtonLabel: string;
    historyTitle: string;
    emptyMessage: string;
    selectPrompt: string;
    newModalTitle: string;
    editModalTitle: string;
    savedNewMessage: string;
    savedEditMessage: string;
    deletedMessage: string;
    confirmDelete: () => string;
    rowKey: (record: T) => string | number;
    matchesContext: (record: T, context: Context) => boolean;
    historyColumns: Column<T>[];
    studentColumns: StudentColumn<T>[];
    Form: ComponentType<FormProps<T> & F>;
    sort?: (a: T, b: T) => number;
    maxCount?: number;
};

export function studentCountColumn<T>(max?: number): StudentColumn<T> {
    return {
        header: 'Évaluations',
        render: (student, records) => {
            const count = records.filter(
                (record) =>
                    (record as { id_eleve: number }).id_eleve ===
                    student.id_eleve,
            ).length;

            return max != null ? `${count} / ${max}` : String(count);
        },
    };
}

export function studentAverageColumn<T>(
    average: (records: T[]) => number | null,
    format: (value: number) => string,
): StudentColumn<T> {
    return {
        header: 'Moyenne',
        render: (student, records) => {
            const value = average(
                records.filter(
                    (record) =>
                        (record as { id_eleve: number }).id_eleve ===
                        student.id_eleve,
                ),
            );

            return value === null ? '—' : format(value);
        },
    };
}

export function noAverageColumn<T>(): StudentColumn<T> {
    return {
        header: 'Moyenne',
        render: () => '—',
    };
}

type Props<T, F extends object> = {
    eleves: Eleve[];
    authUserId: number;
    matiereId?: number | null;
    trimestre?: string;
    selectedEleveId: number | null;
    onSelectEleve: (idEleve: number) => void;
    refreshKey: number;
    config: ResourceConfig<T, F>;
    formProps: F;
    onChanged: () => void;
};

export default function SaisieWorkbench<T, F extends object>({
    eleves,
    authUserId,
    matiereId,
    trimestre,
    selectedEleveId,
    onSelectEleve,
    refreshKey,
    config,
    formProps,
    onChanged,
}: Props<T, F>) {
    const [records, setRecords] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<T | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const context: Context = { authUserId, matiereId, trimestre };

        apiFetch(config.endpoint)
            .then(async (response) => {
                setError(null);
                const data = await response.json();

                if (!response.ok) {
                    setError(
                        data.message ??
                            'Erreur lors du chargement des données.',
                    );

                    return;
                }

                const all = (Array.isArray(data) ? data : []) as T[];
                setRecords(
                    all.filter((record) =>
                        config.matchesContext(record, context),
                    ),
                );
            })
            .catch(() => setError('Impossible de charger les données.'))
            .finally(() => setLoading(false));
    }, [authUserId, config, matiereId, refreshKey, trimestre]);

    const selectedStudent =
        eleves.find((eleve) => eleve.id_eleve === selectedEleveId) ?? null;

    const studentHistory = useMemo(() => {
        if (selectedStudent == null) {
            return [];
        }

        const list = records.filter(
            (record) =>
                (record as { id_eleve: number }).id_eleve ===
                selectedStudent.id_eleve,
        );

        return config.sort != null ? [...list].sort(config.sort) : list;
    }, [config, records, selectedStudent]);

    const filteredEleves = eleves.filter((eleve) =>
        `${eleve.nom} ${eleve.prenom}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
    );

    const canAdd =
        selectedStudent != null &&
        (config.maxCount == null || studentHistory.length < config.maxCount);

    function openNew() {
        setError(null);
        setSuccess(null);
        setEditing(null);
        setModalOpen(true);
    }

    function openEdit(record: T) {
        setError(null);
        setSuccess(null);
        setEditing(record);
        setModalOpen(true);
    }

    function handleSaved(saved: T) {
        setRecords((current) =>
            editing != null
                ? current.map((record) =>
                      config.rowKey(record) === config.rowKey(editing)
                          ? saved
                          : record,
                  )
                : [saved, ...current],
        );
        setSuccess(
            editing != null ? config.savedEditMessage : config.savedNewMessage,
        );
        setModalOpen(false);
        setEditing(null);
        onChanged();
    }

    async function handleDelete(record: T) {
        const id = config.rowKey(record);

        setDeletingId(id);
        setError(null);

        try {
            const response = await apiFetch(`${config.endpoint}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message ?? 'Erreur lors de la suppression.');

                return;
            }

            setRecords((current) =>
                current.filter((item) => config.rowKey(item) !== id),
            );
            setSuccess(config.deletedMessage);
            onChanged();
        } catch {
            setError('Une erreur est survenue lors de la suppression.');
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    }

    const actionsColumn: Column<T> = {
        header: 'Actions',
        align: 'right',
        render: (record) => {
            const id = config.rowKey(record);

            return (
                <>
                    <button
                        type="button"
                        onClick={() => openEdit(record)}
                        className="mr-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                        Modifier
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeleteTarget(record)}
                        disabled={deletingId === id}
                        className="text-sm font-medium text-slate-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-red-400"
                    >
                        {deletingId === id ? 'Suppression...' : 'Supprimer'}
                    </button>
                </>
            );
        },
    };

    const historyColumns = [...config.historyColumns, actionsColumn];
    const Form = config.Form;

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="p-0">
                    <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                        <label
                            htmlFor="saisie-student-search"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Rechercher un élève
                        </label>
                        <input
                            id="saisie-student-search"
                            type="search"
                            value={search}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Nom, prénom..."
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    {loading ? (
                        <div className="space-y-3 p-4">
                            {[0, 1, 2, 3].map((item) => (
                                <Skeleton key={item} />
                            ))}
                        </div>
                    ) : filteredEleves.length === 0 ? (
                        <p className="p-4 text-sm text-slate-500 dark:text-slate-400">
                            Aucun élève ne correspond à votre recherche.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
                                        <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                            Nom
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                            Prénom
                                        </th>
                                        {config.studentColumns.map((column) => (
                                            <th
                                                key={column.header}
                                                className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400"
                                            >
                                                {column.header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEleves.map((eleve) => {
                                        const isSelected =
                                            eleve.id_eleve === selectedEleveId;

                                        return (
                                            <tr
                                                key={eleve.id_eleve}
                                                onClick={() =>
                                                    onSelectEleve(
                                                        eleve.id_eleve,
                                                    )
                                                }
                                                className={`cursor-pointer border-b border-slate-200 transition-colors dark:border-slate-800 ${
                                                    isSelected
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/30'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                }`}
                                            >
                                                <td
                                                    className={`px-3 py-2 font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : ''}`}
                                                >
                                                    {eleve.nom}
                                                </td>
                                                <td
                                                    className={`px-3 py-2 ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : ''}`}
                                                >
                                                    {eleve.prenom}
                                                </td>
                                                {config.studentColumns.map(
                                                    (column) => (
                                                        <td
                                                            key={column.header}
                                                            className={`px-3 py-2 ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : ''}`}
                                                        >
                                                            {column.render(
                                                                eleve,
                                                                records,
                                                            )}
                                                        </td>
                                                    ),
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                <Card className="p-0">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {config.historyTitle}
                        </h3>
                        <Button
                            type="button"
                            size="sm"
                            onClick={openNew}
                            disabled={!canAdd}
                        >
                            {config.addButtonLabel}
                        </Button>
                    </div>

                    <div className="p-4">
                        {selectedStudent == null ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {config.selectPrompt}
                            </p>
                        ) : loading ? (
                            <div className="space-y-3">
                                {[0, 1, 2].map((item) => (
                                    <Skeleton key={item} />
                                ))}
                            </div>
                        ) : studentHistory.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {config.emptyMessage}
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                                <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
                                            {historyColumns.map((column) => (
                                                <th
                                                    key={column.header}
                                                    className={`px-3 py-2 font-medium text-slate-500 dark:text-slate-400 ${
                                                        column.align === 'right'
                                                            ? 'text-right'
                                                            : 'text-left'
                                                    }`}
                                                >
                                                    {column.header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentHistory.map((record) => (
                                            <tr
                                                key={config.rowKey(record)}
                                                className="border-b border-slate-200 dark:border-slate-800"
                                            >
                                                {historyColumns.map(
                                                    (column) => (
                                                        <td
                                                            key={column.header}
                                                            className={`px-3 py-2 ${
                                                                column.align ===
                                                                'right'
                                                                    ? 'text-right'
                                                                    : ''
                                                            }`}
                                                        >
                                                            {column.render(
                                                                record,
                                                            )}
                                                        </td>
                                                    ),
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <Modal
                open={modalOpen}
                title={`${
                    editing != null
                        ? config.editModalTitle
                        : config.newModalTitle
                } — ${selectedStudent?.prenom ?? ''} ${selectedStudent?.nom ?? ''}`}
                onClose={() => setModalOpen(false)}
            >
                {selectedStudent != null && (
                    <Form
                        eleve={selectedStudent}
                        initial={editing}
                        onSaved={handleSaved}
                        onCancel={() => setModalOpen(false)}
                        {...formProps}
                    />
                )}
            </Modal>

            <ConfirmDialog
                open={deleteTarget != null}
                title="Supprimer"
                description={
                    deleteTarget != null
                        ? `${config.confirmDelete()} Cette action est irréversible.`
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
        </div>
    );
}
