import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from '@/components/ui/Button';
import { apiFetch } from '@/lib/auth';

export type Absence = {
    id_absence: number;
    date_absence: string;
    justifiee: boolean;
    motif: string | null;
    id_eleve: number;
    id_utilisateur: number;
};

type Props = {
    eleve: { id_eleve: number; nom: string; prenom: string };
    initial?: Absence | null;
    onSaved: (absence: Absence) => void;
    onCancel: () => void;
};

export default function AbsenceEntryForm({
    eleve,
    initial = null,
    onSaved,
    onCancel,
}: Props) {
    const [dateAbsence, setDateAbsence] = useState(
        initial != null
            ? String(initial.date_absence).slice(0, 10)
            : new Date().toISOString().slice(0, 10),
    );
    const [justifiee, setJustifiee] = useState(initial?.justifiee ?? false);
    const [motif, setMotif] = useState(initial?.motif ?? '');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setProcessing(true);

        const payload: Record<string, string | number | boolean> = {
            date_absence: dateAbsence,
            justifiee,
            id_eleve: eleve.id_eleve,
        };

        if (motif !== '') {
            payload.motif = motif;
        }

        try {
            const response = await apiFetch(
                initial != null
                    ? `/api/absences/${initial.id_absence}`
                    : '/api/absences',
                {
                    method: initial != null ? 'PUT' : 'POST',
                    body: JSON.stringify(payload),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                const message = data.message
                    ? data.message
                    : data.errors
                      ? Object.values(data.errors).flat().join(', ')
                      : "Erreur lors de l'enregistrement.";
                setError(message);
                setProcessing(false);

                return;
            }

            onSaved(data as Absence);
        } catch {
            setError('Une erreur est survenue. Veuillez réessayer.');
            setProcessing(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
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
                <div className="flex items-end pb-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-900 dark:text-slate-100">
                        <input
                            type="checkbox"
                            checked={justifiee}
                            onChange={(e) => setJustifiee(e.target.checked)}
                            className="h-4 w-4"
                        />
                        Absence justifiée
                    </label>
                </div>
            </div>

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
                <Button type="submit" disabled={processing}>
                    {processing
                        ? 'Enregistrement...'
                        : initial != null
                          ? "Enregistrer l'absence"
                          : "Ajouter l'absence"}
                </Button>
                <Button type="button" tone="secondary" onClick={onCancel}>
                    Annuler
                </Button>
            </div>
        </form>
    );
}
