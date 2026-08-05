import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from '@/components/ui/Button';
import { apiFetch } from '@/lib/auth';

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
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
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
                const message = data.message
                    ? data.message
                    : data.errors
                      ? Object.values(data.errors).flat().join(', ')
                      : "Erreur lors de l'enregistrement.";
                setError(message);
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    {error}
                </div>
            )}

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
                        required
                        min={0}
                        max={20}
                        step={0.25}
                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
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
                        required
                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                </div>
            </div>

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
