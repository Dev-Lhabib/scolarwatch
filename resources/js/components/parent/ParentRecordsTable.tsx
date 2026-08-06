import { Inbox } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import { apiFetch } from '@/lib/auth';

export type Child = {
    id_eleve: number;
    nom: string;
    prenom: string;
    id_classe: number;
    classe: { id_classe: number; nom: string; niveau: string } | null;
};

export type Column<T> = {
    header: string;
    align?: 'left' | 'right';
    render: (row: T) => ReactNode;
};

type Props<T> = {
    title: string;
    endpoint: string;
    columns: Column<T>[];
    emptyMessage: string;
    rowKey: (row: T) => string | number;
};

function EmptyState({ message }: { message: string }) {
    return (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="mb-4 h-10 w-10 text-slate-500 dark:text-slate-400" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {message}
            </p>
        </Card>
    );
}

export default function ParentRecordsTable<T>({
    title,
    endpoint,
    columns,
    emptyMessage,
    rowKey,
}: Props<T>) {
    const [children, setChildren] = useState<Child[]>([]);
    const [records, setRecords] = useState<T[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
    const [loadingChildren, setLoadingChildren] = useState(true);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function loadChildren() {
            try {
                const response = await apiFetch('/api/parent/children');
                const data = await response.json();

                if (!response.ok) {
                    if (active) {
                        setError('Impossible de charger vos enfants.');
                    }

                    return;
                }

                const list: Child[] = Array.isArray(data) ? data : [];

                if (active) {
                    setChildren(list);

                    if (list.length > 0) {
                        setSelectedChildId(list[0].id_eleve);
                        setLoadingRecords(true);
                    }
                }
            } catch {
                if (active) {
                    setError('Impossible de charger vos enfants.');
                }
            } finally {
                if (active) {
                    setLoadingChildren(false);
                }
            }
        }

        loadChildren();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (selectedChildId === null) {
            return;
        }

        let active = true;

        apiFetch(`${endpoint}?id_eleve=${selectedChildId}`)
            .then(async (response) => {
                const data = await response.json();

                if (!active) {
                    return;
                }

                if (!response.ok) {
                    setError(
                        data.message ??
                            'Erreur lors du chargement des données.',
                    );
                    setRecords([]);

                    return;
                }

                setRecords(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                if (active) {
                    setError('Impossible de charger les données.');
                }
            })
            .finally(() => {
                if (active) {
                    setLoadingRecords(false);
                }
            });

        return () => {
            active = false;
        };
    }, [endpoint, selectedChildId]);

    function handleChildChange(value: number) {
        setSelectedChildId(value);
        setLoadingRecords(true);
        setError(null);
    }

    const selectedChild =
        children.find((child) => child.id_eleve === selectedChildId) ?? null;

    return (
        <>
            <h1 className="mb-6 text-xl font-medium text-slate-900 dark:text-slate-100">
                {title}
            </h1>

            {error && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    {error}
                </div>
            )}

            {loadingChildren ? (
                <Card>
                    <Skeleton className="mb-2 h-5 w-1/3" />
                    <Skeleton className="mb-1 h-4 w-full" />
                    <Skeleton className="mb-1 h-4 w-full" />
                    <Skeleton className="mb-1 h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </Card>
            ) : children.length === 0 ? (
                <EmptyState message="Aucun enfant n'est associé à votre compte." />
            ) : (
                <>
                    <div className="mb-6 max-w-sm">
                        <label
                            htmlFor="child-select"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Enfant
                        </label>
                        <Select
                            id="child-select"
                            value={selectedChildId ?? ''}
                            onChange={(e) =>
                                handleChildChange(Number(e.target.value))
                            }
                        >
                            {children.map((child) => (
                                <option
                                    key={child.id_eleve}
                                    value={child.id_eleve}
                                >
                                    {child.prenom} {child.nom}
                                    {child.classe
                                        ? ` — ${child.classe.nom} ${child.classe.niveau}`
                                        : ''}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {selectedChild && (
                        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                            {selectedChild.prenom} {selectedChild.nom}
                            {selectedChild.classe
                                ? ` — ${selectedChild.classe.nom} ${selectedChild.classe.niveau}`
                                : ''}
                        </p>
                    )}

                    {loadingRecords ? (
                        <Card>
                            {[0, 1, 2, 3].map((row) => (
                                <Skeleton
                                    key={row}
                                    className="mb-3 h-4 w-full"
                                />
                            ))}
                        </Card>
                    ) : records.length === 0 ? (
                        <EmptyState message={emptyMessage} />
                    ) : (
                        <Card className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
                                            {columns.map((column) => (
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
                                        {records.map((record) => (
                                            <tr
                                                key={rowKey(record)}
                                                className="border-b border-slate-200 dark:border-slate-800"
                                            >
                                                {columns.map((column) => (
                                                    <td
                                                        key={column.header}
                                                        className={`px-3 py-2 ${
                                                            column.align ===
                                                            'right'
                                                                ? 'text-right'
                                                                : ''
                                                        }`}
                                                    >
                                                        {column.render(record)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </>
    );
}
