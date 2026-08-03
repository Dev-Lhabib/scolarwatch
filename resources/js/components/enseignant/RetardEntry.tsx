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

type Retard = {
    id_retard: number;
    date_retard: string;
    justifiee: boolean;
    minutes_retard: number;
    motif: string | null;
    id_eleve: number;
    id_utilisateur: number;
};

type Props = {
    eleves: Eleve[];
    authUserId: number;
    onChanged: () => void;
    refreshKey: number;
};

export default function RetardEntry({
    eleves,
    authUserId,
    onChanged,
    refreshKey,
}: Props) {
    const [retards, setRetards] = useState<Retard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [idEleve, setIdEleve] = useState('');
    const [dateRetard, setDateRetard] = useState(
        new Date().toISOString().slice(0, 10),
    );
    const [justifiee, setJustifiee] = useState(false);
    const [minutesRetard, setMinutesRetard] = useState('');
    const [motif, setMotif] = useState('');

    const eleveIds = useMemo(
        () => new Set(eleves.map((eleve) => eleve.id_eleve)),
        [eleves],
    );

    useEffect(() => {
        apiFetch('/api/retards')
            .then(async (response) => {
                setError(null);
                const data = await response.json();

                if (!response.ok) {
                    setError(
                        data.message ??
                            'Erreur lors du chargement des retards.',
                    );

                    return;
                }

                setRetards(
                    (data as Retard[]).filter(
                        (retard) =>
                            retard.id_utilisateur === authUserId &&
                            eleveIds.has(retard.id_eleve),
                    ),
                );
            })
            .catch(() => {
                setError('Impossible de charger les retards.');
            })
            .finally(() => setLoading(false));
    }, [authUserId, eleveIds, refreshKey]);

    function eleveName(id: number): string {
        const eleve = eleves.find((item) => item.id_eleve === id);

        return eleve ? `${eleve.prenom} ${eleve.nom}` : '';
    }

    function resetForm() {
        setIdEleve('');
        setDateRetard(new Date().toISOString().slice(0, 10));
        setJustifiee(false);
        setMinutesRetard('');
        setMotif('');
    }

    function startEdit(retard: Retard) {
        setError(null);
        setSuccess(null);
        setEditingId(retard.id_retard);
        setIdEleve(String(retard.id_eleve));
        setDateRetard(String(retard.date_retard).slice(0, 10));
        setJustifiee(retard.justifiee);
        setMinutesRetard(String(retard.minutes_retard));
        setMotif(retard.motif ?? '');
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setProcessing(true);

        const payload: Record<string, string | number | boolean> = {
            date_retard: dateRetard,
            justifiee,
            minutes_retard: Number(minutesRetard),
            id_eleve: Number(idEleve),
        };

        if (motif !== '') {
            payload.motif = motif;
        }

        try {
            const response = await apiFetch(
                editingId != null
                    ? `/api/retards/${editingId}`
                    : '/api/retards',
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
                setRetards((current) =>
                    current.map((retard) =>
                        retard.id_retard === editingId
                            ? { ...retard, ...payload }
                            : retard,
                    ),
                );
                setSuccess('Retard modifié avec succès.');
            } else {
                setRetards((current) => [data, ...current]);
                setSuccess(
                    `Retard enregistré pour ${eleveName(payload.id_eleve as number)}.`,
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

    async function handleDelete(retard: Retard) {
        if (
            !window.confirm(
                `Supprimer le retard de ${eleveName(retard.id_eleve)} ?`,
            )
        ) {
            return;
        }

        setDeletingId(retard.id_retard);
        setError(null);

        try {
            const response = await apiFetch(
                `/api/retards/${retard.id_retard}`,
                { method: 'DELETE' },
            );

            if (!response.ok) {
                const data = await response.json();
                setError(
                    data.message ?? 'Erreur lors de la suppression.',
                );

                return;
            }

            setRetards((current) =>
                current.filter((item) => item.id_retard !== retard.id_retard),
            );
            setSuccess('Retard supprimé.');
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
                Saisie des retards
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
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="retard-eleve"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Élève
                        </label>
                        <Select
                            id="retard-eleve"
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
                            htmlFor="retard-date"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Date
                        </label>
                        <input
                            id="retard-date"
                            type="date"
                            value={dateRetard}
                            onChange={(e) => setDateRetard(e.target.value)}
                            required
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="retard-minutes"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Minutes de retard
                        </label>
                        <input
                            id="retard-minutes"
                            type="number"
                            value={minutesRetard}
                            onChange={(e) =>
                                setMinutesRetard(e.target.value)
                            }
                            required
                            min={1}
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>
                    <div className="flex items-end pb-2">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-900 dark:text-slate-100">
                            <input
                                type="checkbox"
                                checked={justifiee}
                                onChange={(e) =>
                                    setJustifiee(e.target.checked)
                                }
                                className="h-4 w-4"
                            />
                            Retard justifié
                        </label>
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="retard-motif"
                        className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                    >
                        Motif
                    </label>
                    <input
                        id="retard-motif"
                        type="text"
                        value={motif}
                        onChange={(e) => setMotif(e.target.value)}
                        maxLength={255}
                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                </div>

                <div className="flex gap-3">
                    <Button
                        type="submit"
                        disabled={processing}
                    >
                        {processing
                            ? 'Enregistrement...'
                            : editingId != null
                              ? 'Enregistrer le retard'
                              : 'Ajouter le retard'}
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
            ) : retards.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Aucun retard enregistré.
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
                                    Minutes
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                    Justifié
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                    Motif
                                </th>
                                <th className="px-3 py-2 text-right font-medium text-slate-500 dark:text-slate-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {retards.map((retard) => (
                                <tr
                                    key={retard.id_retard}
                                    className="border-b border-slate-200 dark:border-slate-800"
                                >
                                    <td className="px-3 py-2">
                                        {eleveName(retard.id_eleve)}
                                    </td>
                                    <td className="px-3 py-2">
                                        {String(retard.date_retard).slice(
                                            0,
                                            10,
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        {retard.minutes_retard} min
                                    </td>
                                    <td className="px-3 py-2">
                                        {retard.justifiee ? (
                                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                Justifié
                                            </span>
                                        ) : (
                                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                                Non justifié
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        {retard.motif ?? '—'}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(retard)}
                                            className="mr-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(retard)}
                                            disabled={
                                                deletingId === retard.id_retard
                                            }
                                            className="text-sm font-medium text-slate-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-red-400"
                                        >
                                            {deletingId === retard.id_retard
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
