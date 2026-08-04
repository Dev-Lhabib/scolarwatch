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

type Absence = {
    id_absence: number;
    date_absence: string;
    justifiee: boolean;
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

export default function AbsenceEntry({
    eleves,
    authUserId,
    onChanged,
    refreshKey,
}: Props) {
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [idEleve, setIdEleve] = useState('');
    const [dateAbsence, setDateAbsence] = useState(
        new Date().toISOString().slice(0, 10),
    );
    const [justifiee, setJustifiee] = useState(false);
    const [motif, setMotif] = useState('');

    const eleveIds = useMemo(
        () => new Set(eleves.map((eleve) => eleve.id_eleve)),
        [eleves],
    );

    useEffect(() => {
        apiFetch('/api/absences')
            .then(async (response) => {
                setError(null);
                const data = await response.json();

                if (!response.ok) {
                    setError(
                        data.message ??
                            'Erreur lors du chargement des absences.',
                    );

                    return;
                }

                setAbsences(
                    (data as Absence[]).filter(
                        (absence) =>
                            absence.id_utilisateur === authUserId &&
                            eleveIds.has(absence.id_eleve),
                    ),
                );
            })
            .catch(() => {
                setError('Impossible de charger les absences.');
            })
            .finally(() => setLoading(false));
    }, [authUserId, eleveIds, refreshKey]);

    function eleveName(id: number): string {
        const eleve = eleves.find((item) => item.id_eleve === id);

        return eleve ? `${eleve.prenom} ${eleve.nom}` : '';
    }

    function resetForm() {
        setIdEleve('');
        setDateAbsence(new Date().toISOString().slice(0, 10));
        setJustifiee(false);
        setMotif('');
    }

    function startEdit(absence: Absence) {
        setError(null);
        setSuccess(null);
        setEditingId(absence.id_absence);
        setIdEleve(String(absence.id_eleve));
        setDateAbsence(String(absence.date_absence).slice(0, 10));
        setJustifiee(absence.justifiee);
        setMotif(absence.motif ?? '');
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setProcessing(true);

        const payload: Record<string, string | number | boolean> = {
            date_absence: dateAbsence,
            justifiee,
            id_eleve: Number(idEleve),
        };

        if (motif !== '') {
            payload.motif = motif;
        }

        try {
            const response = await apiFetch(
                editingId != null
                    ? `/api/absences/${editingId}`
                    : '/api/absences',
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
                setAbsences((current) =>
                    current.map((absence) =>
                        absence.id_absence === editingId
                            ? { ...absence, ...payload }
                            : absence,
                    ),
                );
                setSuccess('Absence modifiée avec succès.');
            } else {
                setAbsences((current) => [data, ...current]);
                setSuccess(
                    `Absence enregistrée pour ${eleveName(payload.id_eleve as number)}.`,
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

    async function handleDelete(absence: Absence) {
        if (
            !window.confirm(
                `Supprimer l'absence de ${eleveName(absence.id_eleve)} ?`,
            )
        ) {
            return;
        }

        setDeletingId(absence.id_absence);
        setError(null);

        try {
            const response = await apiFetch(
                `/api/absences/${absence.id_absence}`,
                { method: 'DELETE' },
            );

            if (!response.ok) {
                const data = await response.json();
                setError(
                    data.message ?? 'Erreur lors de la suppression.',
                );

                return;
            }

            setAbsences((current) =>
                current.filter(
                    (item) => item.id_absence !== absence.id_absence,
                ),
            );
            setSuccess('Absence supprimée.');
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
                Saisie des absences
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
                            htmlFor="absence-eleve"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Élève
                        </label>
                        <Select
                            id="absence-eleve"
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
                            htmlFor="absence-date"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Date
                        </label>
                        <input
                            id="absence-date"
                            type="date"
                            value={dateAbsence}
                            onChange={(e) => setDateAbsence(e.target.value)}
                            required
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-900 dark:text-slate-100">
                    <input
                        type="checkbox"
                        checked={justifiee}
                        onChange={(e) => setJustifiee(e.target.checked)}
                        className="h-4 w-4"
                    />
                    Absence justifiée
                </label>

                <div>
                    <label
                        htmlFor="absence-motif"
                        className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                    >
                        Motif
                    </label>
                    <input
                        id="absence-motif"
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
                              ? 'Enregistrer l\'absence'
                              : 'Ajouter l\'absence'}
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
            ) : absences.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Aucune absence enregistrée.
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
                                    Justifiée
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
                            {absences.map((absence) => (
                                <tr
                                    key={absence.id_absence}
                                    className="border-b border-slate-200 dark:border-slate-800"
                                >
                                    <td className="px-3 py-2">
                                        {eleveName(absence.id_eleve)}
                                    </td>
                                    <td className="px-3 py-2">
                                        {String(absence.date_absence).slice(
                                            0,
                                            10,
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        {absence.justifiee ? (
                                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                Justifiée
                                            </span>
                                        ) : (
                                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                                Non justifiée
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        {absence.motif ?? '—'}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                startEdit(absence)
                                            }
                                            className="mr-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(absence)
                                            }
                                            disabled={
                                                deletingId ===
                                                absence.id_absence
                                            }
                                            className="text-sm font-medium text-slate-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-red-400"
                                        >
                                            {deletingId === absence.id_absence
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
