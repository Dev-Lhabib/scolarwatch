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

type Note = {
    id_note: number;
    valeur: number;
    trimestre: string;
    date: string;
    id_eleve: number;
    id_matiere: number;
    id_utilisateur: number;
};

type Props = {
    eleves: Eleve[];
    matiere: { id_matiere: number; nom: string } | null;
    authUserId: number;
    onChanged: () => void;
    refreshKey: number;
};

export default function NoteEntry({
    eleves,
    matiere,
    authUserId,
    onChanged,
    refreshKey,
}: Props) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [idEleve, setIdEleve] = useState('');
    const [valeur, setValeur] = useState('');
    const [trimestre, setTrimestre] = useState('T1');
    const [date, setDate] = useState(
        new Date().toISOString().slice(0, 10),
    );

    const eleveIds = useMemo(
        () => new Set(eleves.map((eleve) => eleve.id_eleve)),
        [eleves],
    );

    useEffect(() => {
        apiFetch('/api/notes')
            .then(async (response) => {
                setError(null);
                const data = await response.json();

                if (!response.ok) {
                    setError(
                        data.message ??
                            'Erreur lors du chargement des notes.',
                    );

                    return;
                }

                setNotes(
                    (data as Note[]).filter(
                        (note) =>
                            note.id_utilisateur === authUserId &&
                            note.id_matiere === matiere?.id_matiere &&
                            eleveIds.has(note.id_eleve),
                    ),
                );
            })
            .catch(() => {
                setError('Impossible de charger les notes.');
            })
            .finally(() => setLoading(false));
    }, [authUserId, eleveIds, matiere?.id_matiere, refreshKey]);

    function eleveName(id: number): string {
        const eleve = eleves.find((item) => item.id_eleve === id);

        return eleve ? `${eleve.prenom} ${eleve.nom}` : '';
    }

    function resetForm() {
        setIdEleve('');
        setValeur('');
        setTrimestre('T1');
        setDate(new Date().toISOString().slice(0, 10));
    }

    function startEdit(note: Note) {
        setError(null);
        setSuccess(null);
        setEditingId(note.id_note);
        setIdEleve(String(note.id_eleve));
        setValeur(String(note.valeur));
        setTrimestre(note.trimestre);
        setDate(String(note.date).slice(0, 10));
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (!matiere) {
            return;
        }

        setProcessing(true);

        const payload = {
            valeur: Number(valeur),
            trimestre,
            date,
            id_eleve: Number(idEleve),
            id_matiere: matiere.id_matiere,
        };

        try {
            const response = await apiFetch(
                editingId != null
                    ? `/api/notes/${editingId}`
                    : '/api/notes',
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
                setNotes((current) =>
                    current.map((note) =>
                        note.id_note === editingId
                            ? { ...note, ...payload }
                            : note,
                    ),
                );
                setSuccess('Note modifiée avec succès.');
            } else {
                setNotes((current) => [data, ...current]);
                setSuccess(
                    `Note enregistrée pour ${eleveName(payload.id_eleve)}.`,
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

    async function handleDelete(note: Note) {
        if (!window.confirm(`Supprimer la note de ${eleveName(note.id_eleve)} ?`)) {
            return;
        }

        setDeletingId(note.id_note);
        setError(null);

        try {
            const response = await apiFetch(`/api/notes/${note.id_note}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                setError(
                    data.message ?? 'Erreur lors de la suppression.',
                );

                return;
            }

            setNotes((current) =>
                current.filter((item) => item.id_note !== note.id_note),
            );
            setSuccess('Note supprimée.');
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
                Saisie des notes
                {matiere ? ` — ${matiere.nom}` : ''}
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

            {!matiere ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Aucune matière n'est assignée à votre compte.
                </p>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="mb-6 flex flex-col gap-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="note-eleve"
                                className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                            >
                                Élève
                            </label>
                            <Select
                                id="note-eleve"
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="note-trimestre"
                                className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                            >
                                Trimestre
                            </label>
                            <Select
                                id="note-trimestre"
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
                        <Button
                            type="submit"
                            disabled={processing}
                        >
                            {processing
                                ? 'Enregistrement...'
                                : editingId != null
                                  ? 'Enregistrer la note'
                                  : 'Ajouter la note'}
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
            )}

            {loading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Chargement...
                </p>
            ) : notes.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Aucune note enregistrée.
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
                                    Note
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                    Trimestre
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                    Date
                                </th>
                                <th className="px-3 py-2 text-right font-medium text-slate-500 dark:text-slate-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {notes.map((note) => (
                                <tr
                                    key={note.id_note}
                                    className="border-b border-slate-200 dark:border-slate-800"
                                >
                                    <td className="px-3 py-2">
                                        {eleveName(note.id_eleve)}
                                    </td>
                                    <td className="px-3 py-2">
                                        {Number(note.valeur)}/20
                                    </td>
                                    <td className="px-3 py-2">
                                        {note.trimestre}
                                    </td>
                                    <td className="px-3 py-2">
                                        {String(note.date).slice(0, 10)}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(note)}
                                            className="mr-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(note)}
                                            disabled={
                                                deletingId === note.id_note
                                            }
                                            className="text-sm font-medium text-slate-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-red-400"
                                        >
                                            {deletingId === note.id_note
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
