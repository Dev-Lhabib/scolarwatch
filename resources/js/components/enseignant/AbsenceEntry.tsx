import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import AbsenceEntryForm from '@/components/enseignant/AbsenceEntryForm';
import type { Absence } from '@/components/enseignant/AbsenceEntryForm';
import { apiFetch } from '@/lib/auth';

type Props = {
    eleve: { id_eleve: number; nom: string; prenom: string };
    authUserId: number;
    onChanged: () => void;
    refreshKey: number;
};

export default function AbsenceEntry({
    eleve,
    authUserId,
    onChanged,
    refreshKey,
}: Props) {
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Absence | null>(null);

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
                            absence.id_eleve === eleve.id_eleve,
                    ),
                );
            })
            .catch(() => setError('Impossible de charger les absences.'))
            .finally(() => setLoading(false));
    }, [authUserId, eleve.id_eleve, refreshKey]);

    function openNew() {
        setError(null);
        setSuccess(null);
        setEditing(null);
        setModalOpen(true);
    }

    function openEdit(absence: Absence) {
        setError(null);
        setSuccess(null);
        setEditing(absence);
        setModalOpen(true);
    }

    function handleSaved(saved: Absence) {
        setAbsences((current) =>
            editing != null
                ? current.map((absence) =>
                      absence.id_absence === editing.id_absence
                          ? saved
                          : absence,
                  )
                : [saved, ...current],
        );
        setSuccess(
            editing != null
                ? 'Absence modifiée avec succès.'
                : 'Absence enregistrée.',
        );
        setModalOpen(false);
        setEditing(null);
        onChanged();
    }

    async function handleDelete(absence: Absence) {
        if (!window.confirm('Supprimer cette absence ?')) {
            return;
        }

        setDeletingId(absence.id_absence);
        setError(null);

        try {
            const response = await apiFetch(
                `/api/absences/${absence.id_absence}`,
                {
                    method: 'DELETE',
                },
            );

            if (!response.ok) {
                const data = await response.json();
                setError(data.message ?? 'Erreur lors de la suppression.');

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
        <div className="space-y-6">
            {error && (
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                    {success}
                </div>
            )}

            <div>
                <Button type="button" size="sm" onClick={openNew}>
                    + Ajouter une absence
                </Button>
            </div>

            {loading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Chargement...
                </p>
            ) : absences.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Aucune absence enregistrée.
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
                                            onClick={() => openEdit(absence)}
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

            <Modal
                open={modalOpen}
                title={`${
                    editing != null ? "Modifier l'absence" : 'Nouvelle absence'
                } — ${eleve.prenom} ${eleve.nom}`}
                onClose={() => setModalOpen(false)}
            >
                <AbsenceEntryForm
                    eleve={eleve}
                    initial={editing}
                    onSaved={handleSaved}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
