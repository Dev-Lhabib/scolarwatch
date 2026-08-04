import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { apiFetch } from '@/lib/auth';

type Eleve = {
    id_eleve: number;
    nom: string;
    prenom: string;
};

type Remarque = {
    id_remarque: number;
    contenu: string;
    trimestre: string;
    date_remarque: string;
    id_eleve: number;
    id_utilisateur: number;
};

type Props = {
    eleves: Eleve[];
    authUserId: number;
    onChanged: () => void;
    refreshKey: number;
};

export default function RemarqueEntry({
    eleves,
    authUserId,
    onChanged,
    refreshKey,
}: Props) {
    const [remarques, setRemarques] = useState<Remarque[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [idEleve, setIdEleve] = useState('');
    const [contenu, setContenu] = useState('');
    const [trimestre, setTrimestre] = useState('T1');
    const [dateRemarque, setDateRemarque] = useState(
        new Date().toISOString().slice(0, 10),
    );

    const eleveIds = useMemo(
        () => new Set(eleves.map((eleve) => eleve.id_eleve)),
        [eleves],
    );

    useEffect(() => {
        apiFetch('/api/remarques')
            .then(async (response) => {
                setError(null);
                const data = await response.json();

                if (!response.ok) {
                    setError(
                        data.message ??
                            'Erreur lors du chargement des remarques.',
                    );

                    return;
                }

                setRemarques(
                    (data as Remarque[]).filter(
                        (remarque) =>
                            remarque.id_utilisateur === authUserId &&
                            eleveIds.has(remarque.id_eleve),
                    ),
                );
            })
            .catch(() => {
                setError('Impossible de charger les remarques.');
            })
            .finally(() => setLoading(false));
    }, [authUserId, eleveIds, refreshKey]);

    function eleveName(id: number): string {
        const eleve = eleves.find((item) => item.id_eleve === id);

        return eleve ? `${eleve.prenom} ${eleve.nom}` : '';
    }

    function resetForm() {
        setIdEleve('');
        setContenu('');
        setTrimestre('T1');
        setDateRemarque(new Date().toISOString().slice(0, 10));
    }

    function startEdit(remarque: Remarque) {
        setError(null);
        setSuccess(null);
        setEditingId(remarque.id_remarque);
        setIdEleve(String(remarque.id_eleve));
        setContenu(remarque.contenu);
        setTrimestre(remarque.trimestre);
        setDateRemarque(String(remarque.date_remarque).slice(0, 10));
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setProcessing(true);

        const payload: Record<string, string | number> = {
            contenu,
            trimestre,
            date_remarque: dateRemarque,
            id_eleve: Number(idEleve),
        };

        try {
            const response = await apiFetch(
                editingId != null
                    ? `/api/remarques/${editingId}`
                    : '/api/remarques',
                {
                    method: editingId != null ? 'PUT' : 'POST',
                    body: JSON.stringify(payload),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                const message = data.message
                    ? data.message
                    : data.errors
                      ? Object.values(data.errors).flat().join(', ')
                      : 'Erreur lors de l\'enregistrement.';
                setError(message);
                setProcessing(false);

                return;
            }

            if (editingId != null) {
                setRemarques((current) =>
                    current.map((remarque) =>
                        remarque.id_remarque === editingId
                            ? { ...remarque, ...payload }
                            : remarque,
                    ),
                );
                setSuccess('Remarque modifiée avec succès.');
            } else {
                setRemarques((current) => [data, ...current]);
                setSuccess(
                    `Remarque enregistrée pour ${eleveName(payload.id_eleve as number)}.`,
                );
            }

            resetForm();
            setEditingId(null);
            setProcessing(false);
            onChanged();
        } catch {
            setError('Une erreur est survenue. Veuillez réessayer.');
            setProcessing(false);
        }
    }

    async function handleDelete(remarque: Remarque) {
        if (
            !window.confirm(
                `Supprimer la remarque de ${eleveName(remarque.id_eleve)} ?`,
            )
        ) {
            return;
        }

        setDeletingId(remarque.id_remarque);
        setError(null);

        try {
            const response = await apiFetch(
                `/api/remarques/${remarque.id_remarque}`,
                { method: 'DELETE' },
            );

            if (!response.ok) {
                const data = await response.json();
                setError(
                    data.message ?? 'Erreur lors de la suppression.',
                );

                return;
            }

            setRemarques((current) =>
                current.filter(
                    (item) => item.id_remarque !== remarque.id_remarque,
                ),
            );
            setSuccess('Remarque supprimée.');
            onChanged();
        } catch {
            setError('Une erreur est survenue lors de la suppression.');
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="rounded-lg bg-white p-6 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <h2 className="mb-4 text-base font-medium text-slate-900 dark:text-slate-100">
                Saisie des remarques
            </h2>

            {error && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                    {success}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="mb-6 flex flex-col gap-4"
            >
                <div>
                    <label
                        htmlFor="remarque-eleve"
                        className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                    >
                        Élève
                    </label>
                    <Select
                        id="remarque-eleve"
                        value={idEleve}
                        onChange={(e) => setIdEleve(e.target.value)}
                        required
                    >
                        <option value="">
                            Sélectionnez un élève
                        </option>
                        {eleves.map((eleve) => (
                            <option
                                key={eleve.id_eleve}
                                value={eleve.id_eleve}
                            >
                                {eleve.prenom} {eleve.nom}
                            </option>
                        ))}
                    </Select>
                </div>

                <div>
                    <label
                        htmlFor="remarque-contenu"
                        className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                    >
                        Contenu
                    </label>
                    <textarea
                        id="remarque-contenu"
                        value={contenu}
                        onChange={(e) => setContenu(e.target.value)}
                        required
                        rows={3}
                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="remarque-trimestre"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Trimestre
                        </label>
                        <Select
                            id="remarque-trimestre"
                            value={trimestre}
                            onChange={(e) => setTrimestre(e.target.value)}
                            required
                        >
                            <option value="T1">T1</option>
                            <option value="T2">T2</option>
                        </Select>
                    </div>
                    <div>
                        <label
                            htmlFor="remarque-date"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Date
                        </label>
                        <input
                            id="remarque-date"
                            type="date"
                            value={dateRemarque}
                            onChange={(e) => setDateRemarque(e.target.value)}
                            required
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        type="submit"
                        disabled={processing}
                    >
                        {processing
                            ? 'Enregistrement...'
                            : editingId != null
                              ? 'Enregistrer la remarque'
                              : 'Ajouter la remarque'}
                    </Button>
                    {editingId != null && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingId(null);
                                resetForm();
                            }}
                            className="rounded-sm border border-slate-300 px-5 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
                        >
                            Annuler
                        </button>
                    )}
                </div>
            </form>

            {loading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Chargement...
                </p>
            ) : remarques.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Aucune remarque enregistrée.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                    Élève
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                    Date
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                    Trimestre
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                    Contenu
                                </th>
                                <th className="px-3 py-2 text-right font-medium text-slate-500 dark:text-slate-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {remarques.map((remarque) => (
                                <tr
                                    key={remarque.id_remarque}
                                    className="border-b border-slate-200 dark:border-slate-800"
                                >
                                    <td className="px-3 py-2">
                                        {eleveName(remarque.id_eleve)}
                                    </td>
                                    <td className="px-3 py-2">
                                        {String(remarque.date_remarque).slice(
                                            0,
                                            10,
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        {remarque.trimestre}
                                    </td>
                                    <td className="px-3 py-2">
                                        {remarque.contenu}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                startEdit(remarque)
                                            }
                                            className="mr-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(remarque)
                                            }
                                            disabled={
                                                deletingId ===
                                                remarque.id_remarque
                                            }
                                            className="text-sm font-medium text-slate-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-red-400"
                                        >
                                            {deletingId ===
                                            remarque.id_remarque
                                                ? 'Suppression...'
                                                : 'Supprimer'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
