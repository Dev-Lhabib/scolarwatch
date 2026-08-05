import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import RetardEntryForm from '@/components/enseignant/RetardEntryForm';
import type { Retard } from '@/components/enseignant/RetardEntryForm';
import { apiFetch } from '@/lib/auth';

type Props = {
    eleve: { id_eleve: number; nom: string; prenom: string };
    authUserId: number;
    onChanged: () => void;
    refreshKey: number;
};

export default function RetardEntry({
    eleve,
    authUserId,
    onChanged,
    refreshKey,
}: Props) {
    const [retards, setRetards] = useState<Retard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Retard | null>(null);

    useEffect(() => {
        apiFetch('/api/retards')
            .then(async (response) => {
                setError(null);
                const data = await response.json();

                if (!response.ok) {
                    setError(
                        data.message ??
                            'Erreur lors du chargement des retards.',
                    );

                    return;
                }

                setRetards(
                    (data as Retard[]).filter(
                        (retard) =>
                            retard.id_utilisateur === authUserId &&
                            retard.id_eleve === eleve.id_eleve,
                    ),
                );
            })
            .catch(() => setError('Impossible de charger les retards.'))
            .finally(() => setLoading(false));
    }, [authUserId, eleve.id_eleve, refreshKey]);

    function openNew() {
        setError(null);
        setSuccess(null);
        setEditing(null);
        setModalOpen(true);
    }

    function openEdit(retard: Retard) {
        setError(null);
        setSuccess(null);
        setEditing(retard);
        setModalOpen(true);
    }

    function handleSaved(saved: Retard) {
        setRetards((current) =>
            editing != null
                ? current.map((retard) =>
                      retard.id_retard === editing.id_retard ? saved : retard,
                  )
                : [saved, ...current],
        );
        setSuccess(
            editing != null
                ? 'Retard modifié avec succès.'
                : 'Retard enregistré.',
        );
        setModalOpen(false);
        setEditing(null);
        onChanged();
    }

    async function handleDelete(retard: Retard) {
        if (!window.confirm('Supprimer ce retard ?')) {
            return;
        }

        setDeletingId(retard.id_retard);
        setError(null);

        try {
            const response = await apiFetch(
                `/api/retards/${retard.id_retard}`,
                {
                    method: 'DELETE',
                },
            );

            if (!response.ok) {
                const data = await response.json();
                setError(data.message ?? 'Erreur lors de la suppression.');

                return;
            }

            setRetards((current) =>
                current.filter((item) => item.id_retard !== retard.id_retard),
            );
            setSuccess('Retard supprimé.');
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
                    + Ajouter un retard
                </Button>
            </div>

            {loading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Chargement...
                </p>
            ) : retards.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Aucun retard enregistré.
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
                                    Durée
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                    Justifié
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
                            {retards.map((retard) => (
                                <tr
                                    key={retard.id_retard}
                                    className="border-b border-slate-200 dark:border-slate-800"
                                >
                                    <td className="px-3 py-2">
                                        {String(retard.date_retard).slice(
                                            0,
                                            10,
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        {retard.minutes_retard} min
                                    </td>
                                    <td className="px-3 py-2">
                                        {retard.justifiee ? (
                                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                Justifié
                                            </span>
                                        ) : (
                                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                                Non justifié
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        {retard.motif ?? '—'}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(retard)}
                                            className="mr-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(retard)}
                                            disabled={
                                                deletingId === retard.id_retard
                                            }
                                            className="text-sm font-medium text-slate-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-red-400"
                                        >
                                            {deletingId === retard.id_retard
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
                    editing != null ? 'Modifier le retard' : 'Nouveau retard'
                } — ${eleve.prenom} ${eleve.nom}`}
                onClose={() => setModalOpen(false)}
            >
                <RetardEntryForm
                    eleve={eleve}
                    initial={editing}
                    onSaved={handleSaved}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
