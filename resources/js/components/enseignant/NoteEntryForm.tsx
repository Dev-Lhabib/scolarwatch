import { useState } from 'react';
import type { FormEvent } from 'react';
import FieldError from '@/components/ui/FieldError';
import Button from '@/components/ui/Button';
import { apiFetch } from '@/lib/auth';
import { fieldClassName, formError } from '@/lib/forms';

export type Note = {
    id_note: number;
    valeur: string;
    trimestre: string;
    date: string;
    id_eleve: number;
    id_matiere: number;
    id_utilisateur: number;
};

type Props = {
    eleve: { id_eleve: number; nom: string; prenom: string };
    trimestre: string;
    matiere: { id_matiere: number; nom: string };
    initial?: Note | null;
    onSaved: (note: Note) => void;
    onCancel: () => void;
};

export default function NoteEntryForm({
    eleve,
    trimestre,
    matiere,
    initial = null,
    onSaved,
    onCancel,
}: Props) {
    const [valeur, setValeur] = useState(
        initial != null ? String(Number(initial.valeur)) : '',
    );
    const [date, setDate] = useState(
        initial != null
            ? String(initial.date).slice(0, 10)
            : new Date().toISOString().slice(0, 10),
    );
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setErrors({});
        setError(null);
        setProcessing(true);

        const payload = {
            valeur: Number(valeur),
            trimestre,
            date,
            id_eleve: eleve.id_eleve,
            id_matiere: matiere.id_matiere,
        };

        try {
            const response = await apiFetch(
                initial != null
                    ? `/api/notes/${initial.id_note}`
                    : '/api/notes',
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
                        formError(fieldErrors, ['valeur', 'date']) ?? null,
                    );
                } else {
                    setError(
                        data.message ?? "Erreur lors de l'enregistrement.",
                    );
                }
                setProcessing(false);

                return;
            }

            onSaved(data as Note);
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
                        htmlFor="note-valeur"
                        className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                    >
                        Note (/20)
                    </label>
                    <input
                        id="note-valeur"
                        type="number"
                        value={valeur}
                        onChange={(e) => setValeur(e.target.value)}
                        className={fieldClassName(Boolean(errors.valeur))}
                    />
                    <FieldError message={errors.valeur?.[0]} />
                </div>
                <div>
                    <label
                        htmlFor="note-date"
                        className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                    >
                        Date
                    </label>
                    <input
                        id="note-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={fieldClassName(Boolean(errors.date))}
                    />
                    <FieldError message={errors.date?.[0]} />
                </div>
            </div>

            {error && <FieldError message={error} />}

            <div className="flex gap-3">
                <Button type="submit" disabled={processing}>
                    {processing
                        ? 'Enregistrement...'
                        : initial != null
                          ? 'Enregistrer'
                          : 'Ajouter'}
                </Button>
                <Button type="button" tone="secondary" onClick={onCancel}>
                    Annuler
                </Button>
            </div>
        </form>
    );
}
