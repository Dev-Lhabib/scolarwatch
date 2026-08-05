import { useState } from 'react';
import type { FormEvent } from 'react';
import FieldError from '@/components/ui/FieldError';
import Button from '@/components/ui/Button';
import { apiFetch } from '@/lib/auth';
import { fieldClassName, formError } from '@/lib/forms';

export type Retard = {
    id_retard: number;
    date_retard: string;
    justifiee: boolean;
    minutes_retard: number;
    motif: string | null;
    id_eleve: number;
    id_utilisateur: number;
};

type Props = {
    eleve: { id_eleve: number; nom: string; prenom: string };
    initial?: Retard | null;
    onSaved: (retard: Retard) => void;
    onCancel: () => void;
};

export default function RetardEntryForm({
    eleve,
    initial = null,
    onSaved,
    onCancel,
}: Props) {
    const [dateRetard, setDateRetard] = useState(
        initial != null
            ? String(initial.date_retard).slice(0, 10)
            : new Date().toISOString().slice(0, 10),
    );
    const [justifiee, setJustifiee] = useState(initial?.justifiee ?? false);
    const [minutesRetard, setMinutesRetard] = useState(
        initial != null ? String(initial.minutes_retard) : '',
    );
    const [motif, setMotif] = useState(initial?.motif ?? '');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setErrors({});
        setError(null);
        setProcessing(true);

        const payload: Record<string, string | number | boolean> = {
            date_retard: dateRetard,
            justifiee,
            minutes_retard: Number(minutesRetard),
            id_eleve: eleve.id_eleve,
        };

        if (motif !== '') {
            payload.motif = motif;
        }

        try {
            const response = await apiFetch(
                initial != null
                    ? `/api/retards/${initial.id_retard}`
                    : '/api/retards',
                {
                    method: initial != null ? 'PUT' : 'POST',
                    body: JSON.stringify(payload),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                const fieldErrors = data.errors ?? {};
                setErrors(fieldErrors);

                if (Object.keys(fieldErrors).length > 0) {
                    setError(
                        formError(fieldErrors, [
                            'date_retard',
                            'minutes_retard',
                            'motif',
                        ]) ?? null,
                    );
                } else {
                    setError(
                        data.message ?? "Erreur lors de l'enregistrement.",
                    );
                }
                setProcessing(false);

                return;
            }

            onSaved(data as Retard);
        } catch {
            setError('Une erreur est survenue. Veuillez réessayer.');
            setProcessing(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4"
        >
            <div className="grid grid-cols-2 gap-4">
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
                        className={fieldClassName(Boolean(errors.date_retard))}
                    />
                    <FieldError message={errors.date_retard?.[0]} />
                </div>
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
                        onChange={(e) => setMinutesRetard(e.target.value)}
                        className={fieldClassName(
                            Boolean(errors.minutes_retard),
                        )}
                    />
                    <FieldError message={errors.minutes_retard?.[0]} />
                </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-900 dark:text-slate-100">
                <input
                    type="checkbox"
                    checked={justifiee}
                    onChange={(e) => setJustifiee(e.target.checked)}
                    className="h-4 w-4"
                />
                Retard justifié
            </label>

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
                    className={fieldClassName(Boolean(errors.motif))}
                />
                <FieldError message={errors.motif?.[0]} />
            </div>

            {error && <FieldError message={error} />}

            <div className="flex gap-3">
                <Button type="submit" disabled={processing}>
                    {processing
                        ? 'Enregistrement...'
                        : initial != null
                          ? 'Enregistrer le retard'
                          : 'Ajouter le retard'}
                </Button>
                <Button type="button" tone="secondary" onClick={onCancel}>
                    Annuler
                </Button>
            </div>
        </form>
    );
}
