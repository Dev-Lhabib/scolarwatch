import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import NoteEntryForm from '@/components/enseignant/NoteEntryForm';
import type { Note } from '@/components/enseignant/NoteEntryForm';
import { apiFetch } from '@/lib/auth';

type Props = {
    eleve: { id_eleve: number; nom: string; prenom: string };
    trimestre: string;
    matiere: { id_matiere: number; nom: string } | null;
    authUserId: number;
    onChanged: () => void;
    refreshKey: number;
};

const MAX_NOTES = 4;

export default function NoteEntry({
    eleve,
    trimestre,
    matiere,
    authUserId,
    onChanged,
    refreshKey,
}: Props) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Note | null>(null);
    const [calculatedAverage, setCalculatedAverage] = useState<number | null>(
        null,
    );
    const [averageDirty, setAverageDirty] = useState(false);

    useEffect(() => {
        apiFetch('/api/notes')
            .then(async (response) => {
                setError(null);
                const data = await response.json();

                if (!response.ok) {
                    setError(
                        data.message ?? 'Erreur lors du chargement des notes.',
                    );

                    return;
                }

                setNotes(
                    (data as Note[]).filter(
                        (note) =>
                            note.id_utilisateur === authUserId &&
                            note.id_matiere === matiere?.id_matiere &&
                            note.id_eleve === eleve.id_eleve &&
                            note.trimestre === trimestre,
                    ),
                );
            })
            .catch(() => setError('Impossible de charger les notes.'))
            .finally(() => setLoading(false));
    }, [
        authUserId,
        eleve.id_eleve,
        matiere?.id_matiere,
        trimestre,
        refreshKey,
    ]);

    const progress = `${notes.length}/${MAX_NOTES}`;

    const liveAverage = useMemo(() => {
        if (notes.length === 0) {
            return null;
        }

        const total = notes.reduce((sum, note) => sum + Number(note.valeur), 0);

        return total / notes.length;
    }, [notes]);

    const formattedAverage = useMemo(() => {
        if (liveAverage === null) {
            return null;
        }

        return liveAverage.toFixed(2).replace('.', ',');
    }, [liveAverage]);

    function openNew() {
        setError(null);
        setSuccess(null);
        setEditing(null);
        setModalOpen(true);
    }

    function openEdit(note: Note) {
        setError(null);
        setSuccess(null);
        setEditing(note);
        setModalOpen(true);
    }

    function handleSaved(saved: Note) {
        setNotes((current) =>
            editing != null
                ? current.map((note) =>
                      note.id_note === editing.id_note ? saved : note,
                  )
                : [saved, ...current],
        );
        setSuccess(
            editing != null
                ? 'Note modifiée avec succès.'
                : 'Note enregistrée.',
        );
        setModalOpen(false);
        setEditing(null);

        if (calculatedAverage !== null) {
            setAverageDirty(true);
        }

        onChanged();
    }

    async function handleDelete(note: Note) {
        if (!window.confirm('Supprimer cette note ?')) {
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
                setError(data.message ?? 'Erreur lors de la suppression.');

                return;
            }

            setNotes((current) =>
                current.filter((item) => item.id_note !== note.id_note),
            );
            setSuccess('Note supprimée.');
            onChanged();

            if (calculatedAverage !== null) {
                setAverageDirty(true);
            }
        } catch {
            setError('Une erreur est survenue lors de la suppression.');
        } finally {
            setDeletingId(null);
        }
    }

    function handleCalculate() {
        if (liveAverage === null) {
            return;
        }

        setCalculatedAverage(liveAverage);
        setAverageDirty(false);
    }

    if (loading) {
        return (
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Chargement...
            </p>
        );
    }

    if (!matiere) {
        return (
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Aucune matière n'est assignée à votre compte. Vous ne pouvez pas
                saisir de notes.
            </p>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                    {success}
                </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {matiere.nom} — {trimestre}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-6">
                    <div>
                        <span className="text-xs tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            Évaluation
                        </span>
                        <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                            {progress}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            sur {MAX_NOTES} évaluations
                        </p>
                    </div>

                    <div>
                        <span className="text-xs tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            Moyenne
                        </span>
                        {calculatedAverage === null ? (
                            <>
                                <p className="mt-1 text-2xl font-semibold text-slate-400 dark:text-slate-500">
                                    —
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Non calculée
                                </p>
                                <div className="mt-2">
                                    <Button
                                        type="button"
                                        tone="secondary"
                                        size="sm"
                                        onClick={handleCalculate}
                                        disabled={notes.length === 0}
                                    >
                                        Calculer la moyenne
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p
                                    className={`mt-1 text-2xl font-semibold ${
                                        averageDirty
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : 'text-indigo-600 dark:text-indigo-400'
                                    }`}
                                >
                                    {formattedAverage} / 20
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {averageDirty ? 'À recalculer' : 'Calculée'}
                                    {` — ${notes.length} évaluation${notes.length > 1 ? 's' : ''}`}
                                </p>
                                {averageDirty && (
                                    <div className="mt-2">
                                        <Button
                                            type="button"
                                            tone="secondary"
                                            size="sm"
                                            onClick={handleCalculate}
                                        >
                                            Recalculer la moyenne
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-4">
                    <Button
                        type="button"
                        size="sm"
                        onClick={openNew}
                        disabled={notes.length >= MAX_NOTES}
                    >
                        + Ajouter une évaluation
                    </Button>
                </div>
            </div>

            <div>
                <h3 className="mb-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                    Historique des évaluations
                </h3>

                {notes.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Aucune évaluation enregistrée.
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
                                    <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                        Date
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                        Note
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
                                            {String(note.date).slice(0, 10)}
                                        </td>
                                        <td className="px-3 py-2 font-medium">
                                            {Number(note.valeur)} / 20
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(note)}
                                                className="mr-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                            >
                                                Modifier
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(note)
                                                }
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

            <Modal
                open={modalOpen}
                title={`${
                    editing != null ? 'Modifier la note' : 'Nouvelle note'
                } — ${eleve.prenom} ${eleve.nom}`}
                onClose={() => setModalOpen(false)}
            >
                {matiere && (
                    <NoteEntryForm
                        eleve={eleve}
                        trimestre={trimestre}
                        matiere={matiere}
                        initial={editing}
                        onSaved={handleSaved}
                        onCancel={() => setModalOpen(false)}
                    />
                )}
            </Modal>
        </div>
    );
}
