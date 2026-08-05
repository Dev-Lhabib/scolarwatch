import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import RemarqueEntryForm from '@/components/enseignant/RemarqueEntryForm';
import type { Remarque } from '@/components/enseignant/RemarqueEntryForm';
import { apiFetch } from '@/lib/auth';

type Props = {
    eleve: { id_eleve: number; nom: string; prenom: string };
    trimestre: string;
    authUserId: number;
    onChanged: () => void;
    refreshKey: number;
};

export default function RemarqueEntry({
    eleve,
    trimestre,
    authUserId,
    onChanged,
    refreshKey,
}: Props) {
    const [remarques, setRemarques] = useState<Remarque[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Remarque | null>(null);

    useEffect(() => {
        apiFetch('/api/remarques')
            .then(async (response) => {
                setError(null);
                const data = await response.json();

                if (!response.ok) {
                    setError(
                        data.message ??
                            'Erreur lors du chargement des remarques.',
                    );

                    return;
                }

                setRemarques(
                    (data as Remarque[])
                        .filter(
                            (remarque) =>
                                remarque.id_utilisateur === authUserId &&
                                remarque.id_eleve === eleve.id_eleve &&
                                remarque.trimestre === trimestre,
                        )
                        .sort((a, b) =>
                            String(a.date_remarque).localeCompare(
                                String(b.date_remarque),
                            ),
                        ),
                );
            })
            .catch(() => setError('Impossible de charger les remarques.'))
            .finally(() => setLoading(false));
    }, [authUserId, eleve.id_eleve, trimestre, refreshKey]);

    function openNew() {
        setError(null);
        setSuccess(null);
        setEditing(null);
        setModalOpen(true);
    }

    function openEdit(remarque: Remarque) {
        setError(null);
        setSuccess(null);
        setEditing(remarque);
        setModalOpen(true);
    }

    function handleSaved(saved: Remarque) {
        setRemarques((current) => {
            const next =
                editing != null
                    ? current.map((remarque) =>
                          remarque.id_remarque === editing.id_remarque
                              ? saved
                              : remarque,
                      )
                    : [...current, saved];

            return next.sort((a, b) =>
                String(a.date_remarque).localeCompare(String(b.date_remarque)),
            );
        });
        setSuccess(
            editing != null
                ? 'Remarque modifiée avec succès.'
                : 'Remarque enregistrée.',
        );
        setModalOpen(false);
        setEditing(null);
        onChanged();
    }

    async function handleDelete(remarque: Remarque) {
        if (!window.confirm('Supprimer cette remarque ?')) {
            return;
        }

        setDeletingId(remarque.id_remarque);
        setError(null);

        try {
            const response = await apiFetch(
                `/api/remarques/${remarque.id_remarque}`,
                {
                    method: 'DELETE',
                },
            );

            if (!response.ok) {
                const data = await response.json();
                setError(data.message ?? 'Erreur lors de la suppression.');

                return;
            }

            setRemarques((current) =>
                current.filter(
                    (item) => item.id_remarque !== remarque.id_remarque,
                ),
            );
            setSuccess('Remarque supprimée.');
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
                <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                    {success}
                </div>
            )}

            <div>
                <Button type="button" size="sm" onClick={openNew}>
                    + Ajouter une remarque
                </Button>
            </div>

            {loading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Chargement...
                </p>
            ) : remarques.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Aucune remarque enregistrée.
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
                                    Trimestre
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                    Contenu
                                </th>
                                <th className="px-3 py-2 text-right font-medium text-slate-500 dark:text-slate-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {remarques.map((remarque) => (
                                <tr
                                    key={remarque.id_remarque}
                                    className="border-b border-slate-200 dark:border-slate-800"
                                >
                                    <td className="px-3 py-2">
                                        {String(remarque.date_remarque).slice(
                                            0,
                                            10,
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        {remarque.trimestre}
                                    </td>
                                    <td className="px-3 py-2">
                                        {remarque.contenu}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(remarque)}
                                            className="mr-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(remarque)
                                            }
                                            disabled={
                                                deletingId ===
                                                remarque.id_remarque
                                            }
                                            className="text-sm font-medium text-slate-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-red-400"
                                        >
                                            {deletingId === remarque.id_remarque
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
                    editing != null
                        ? 'Modifier la remarque'
                        : 'Nouvelle remarque'
                } — ${eleve.prenom} ${eleve.nom}`}
                onClose={() => setModalOpen(false)}
            >
                <RemarqueEntryForm
                    eleve={eleve}
                    trimestre={trimestre}
                    initial={editing}
                    onSaved={handleSaved}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
