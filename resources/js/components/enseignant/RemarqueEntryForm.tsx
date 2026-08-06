import { useState } from 'react';
import type { FormEvent } from 'react';
import FieldError from '@/components/ui/FieldError';
import Button from '@/components/ui/Button';
import { apiFetch } from '@/lib/auth';
import { fieldClassName, formError } from '@/lib/forms';

export type Remarque = {
    id_remarque: number;
    contenu: string;
    categorie: string | null;
    trimestre: string;
    date_remarque: string;
    id_eleve: number;
    id_utilisateur: number;
};

type Props = {
    eleve: { id_eleve: number; nom: string; prenom: string };
    trimestre: string;
    initial?: Remarque | null;
    onSaved: (remarque: Remarque) => void;
    onCancel: () => void;
};

export default function RemarqueEntryForm({
    eleve,
    trimestre,
    initial = null,
    onSaved,
    onCancel,
}: Props) {
    const [contenu, setContenu] = useState(initial?.contenu ?? '');
    const [categorie, setCategorie] = useState(initial?.categorie ?? '');
    const [dateRemarque, setDateRemarque] = useState(
        initial != null
            ? String(initial.date_remarque).slice(0, 10)
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

        const payload: Record<string, string> = {
            contenu,
            trimestre,
            date_remarque: dateRemarque,
            id_eleve: String(eleve.id_eleve),
        };

        if (categorie !== '') {
            payload.categorie = categorie;
        }

        try {
            const response = await apiFetch(
                initial != null
                    ? `/api/remarques/${initial.id_remarque}`
                    : '/api/remarques',
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
                            'contenu',
                            'categorie',
                            'date_remarque',
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

            onSaved(data as Remarque);
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
                    rows={3}
                    className={fieldClassName(Boolean(errors.contenu))}
                />
                <FieldError message={errors.contenu?.[0]} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="remarque-categorie"
                        className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                    >
                        Catégorie
                    </label>
                    <input
                        id="remarque-categorie"
                        type="text"
                        value={categorie}
                        onChange={(e) => setCategorie(e.target.value)}
                        maxLength={100}
                        placeholder="Ex. Comportement, Rédaction..."
                        className={fieldClassName(Boolean(errors.categorie))}
                    />
                    <FieldError message={errors.categorie?.[0]} />
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
                        className={fieldClassName(
                            Boolean(errors.date_remarque),
                        )}
                    />
                    <FieldError message={errors.date_remarque?.[0]} />
                </div>
            </div>

            {error && <FieldError message={error} />}

            <div className="flex gap-3">
                <Button type="submit" disabled={processing}>
                    {processing
                        ? 'Enregistrement...'
                        : initial != null
                          ? 'Enregistrer la remarque'
                          : 'Ajouter la remarque'}
                </Button>
                <Button type="button" tone="secondary" onClick={onCancel}>
                    Annuler
                </Button>
            </div>
        </form>
    );
}
