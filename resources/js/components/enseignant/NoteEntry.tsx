import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
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
        <div className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
            <h2 className="mb-4 text-base font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                Saisie des notes
                {matiere ? ` — ${matiere.nom}` : ''}
            </h2>

            {error && (
                <div className="mb-4 rounded border border-[#f53003]/30 bg-[#f53003]/10 px-3 py-2 text-sm text-[#f53003] dark:text-[#FF4433]">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
                    {success}
                </div>
            )}

            {!matiere ? (
                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
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
                                className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                            >
                                Élève
                            </label>
                            <select
                                id="note-eleve"
                                value={idEleve}
                                onChange={(e) => setIdEleve(e.target.value)}
                                required
                                className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
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
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="note-valeur"
                                className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
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
                                className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="note-trimestre"
                                className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                            >
                                Trimestre
                            </label>
                            <select
                                id="note-trimestre"
                                value={trimestre}
                                onChange={(e) => setTrimestre(e.target.value)}
                                required
                                className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                            >
                                <option value="T1">T1</option>
                                <option value="T2">T2</option>
                                <option value="T3">T3</option>
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="note-date"
                                className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                            >
                                Date
                            </label>
                            <input
                                id="note-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-sm border border-black bg-[#1b1b18] px-5 py-2 text-sm font-medium text-white hover:border-black hover:bg-black disabled:opacity-50 dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                        >
                            {processing
                                ? 'Enregistrement...'
                                : editingId != null
                                  ? 'Enregistrer la note'
                                  : 'Ajouter la note'}
                        </button>
                        {editingId != null && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    resetForm();
                                }}
                                className="rounded-sm border border-[#e3e3e0] px-5 py-2 text-sm font-medium text-[#706f6c] hover:text-[#1b1b18] dark:border-[#3E3E3A] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                            >
                                Annuler
                            </button>
                        )}
                    </div>
                </form>
            )}

            {loading ? (
                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    Chargement...
                </p>
            ) : notes.length === 0 ? (
                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    Aucune note enregistrée.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                        <thead>
                            <tr className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                <th className="px-3 py-2 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Élève
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Note
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Trimestre
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Date
                                </th>
                                <th className="px-3 py-2 text-right font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {notes.map((note) => (
                                <tr
                                    key={note.id_note}
                                    className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]"
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
                                            className="mr-4 text-sm font-medium text-[#f53003] hover:underline dark:text-[#FF4433]"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(note)}
                                            disabled={
                                                deletingId === note.id_note
                                            }
                                            className="text-sm font-medium text-[#706f6c] hover:text-[#f53003] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#A1A09A] dark:hover:text-[#FF4433]"
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
