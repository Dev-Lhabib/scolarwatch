import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { apiFetch } from '@/lib/auth';

type Eleve = {
    id_eleve: number;
    nom: string;
    prenom: string;
};

type Remarque = {
    id_remarque: number;
    contenu: string;
    trimestre: string;
    date_remarque: string;
    id_eleve: number;
    id_utilisateur: number;
};

type Props = {
    eleves: Eleve[];
    authUserId: number;
    onChanged: () => void;
    refreshKey: number;
};

export default function RemarqueEntry({
    eleves,
    authUserId,
    onChanged,
    refreshKey,
}: Props) {
    const [remarques, setRemarques] = useState<Remarque[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [idEleve, setIdEleve] = useState('');
    const [contenu, setContenu] = useState('');
    const [trimestre, setTrimestre] = useState('T1');
    const [dateRemarque, setDateRemarque] = useState(
        new Date().toISOString().slice(0, 10),
    );

    const eleveIds = useMemo(
        () => new Set(eleves.map((eleve) => eleve.id_eleve)),
        [eleves],
    );

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
                    (data as Remarque[]).filter(
                        (remarque) =>
                            remarque.id_utilisateur === authUserId &&
                            eleveIds.has(remarque.id_eleve),
                    ),
                );
            })
            .catch(() => {
                setError('Impossible de charger les remarques.');
            })
            .finally(() => setLoading(false));
    }, [authUserId, eleveIds, refreshKey]);

    function eleveName(id: number): string {
        const eleve = eleves.find((item) => item.id_eleve === id);

        return eleve ? `${eleve.prenom} ${eleve.nom}` : '';
    }

    function resetForm() {
        setIdEleve('');
        setContenu('');
        setTrimestre('T1');
        setDateRemarque(new Date().toISOString().slice(0, 10));
    }

    function startEdit(remarque: Remarque) {
        setError(null);
        setSuccess(null);
        setEditingId(remarque.id_remarque);
        setIdEleve(String(remarque.id_eleve));
        setContenu(remarque.contenu);
        setTrimestre(remarque.trimestre);
        setDateRemarque(String(remarque.date_remarque).slice(0, 10));
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setProcessing(true);

        const payload: Record<string, string | number> = {
            contenu,
            trimestre,
            date_remarque: dateRemarque,
            id_eleve: Number(idEleve),
        };

        try {
            const response = await apiFetch(
                editingId != null
                    ? `/api/remarques/${editingId}`
                    : '/api/remarques',
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
                setRemarques((current) =>
                    current.map((remarque) =>
                        remarque.id_remarque === editingId
                            ? { ...remarque, ...payload }
                            : remarque,
                    ),
                );
                setSuccess('Remarque modifiée avec succès.');
            } else {
                setRemarques((current) => [data, ...current]);
                setSuccess(
                    `Remarque enregistrée pour ${eleveName(payload.id_eleve as number)}.`,
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

    async function handleDelete(remarque: Remarque) {
        if (
            !window.confirm(
                `Supprimer la remarque de ${eleveName(remarque.id_eleve)} ?`,
            )
        ) {
            return;
        }

        setDeletingId(remarque.id_remarque);
        setError(null);

        try {
            const response = await apiFetch(
                `/api/remarques/${remarque.id_remarque}`,
                { method: 'DELETE' },
            );

            if (!response.ok) {
                const data = await response.json();
                setError(
                    data.message ?? 'Erreur lors de la suppression.',
                );

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
        <div className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
            <h2 className="mb-4 text-base font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                Saisie des remarques
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

            <form
                onSubmit={handleSubmit}
                className="mb-6 flex flex-col gap-4"
            >
                <div>
                    <label
                        htmlFor="remarque-eleve"
                        className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                    >
                        Élève
                    </label>
                    <select
                        id="remarque-eleve"
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
                        htmlFor="remarque-contenu"
                        className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                    >
                        Contenu
                    </label>
                    <textarea
                        id="remarque-contenu"
                        value={contenu}
                        onChange={(e) => setContenu(e.target.value)}
                        required
                        rows={3}
                        className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="remarque-trimestre"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Trimestre
                        </label>
                        <select
                            id="remarque-trimestre"
                            value={trimestre}
                            onChange={(e) => setTrimestre(e.target.value)}
                            required
                            className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                        >
                            <option value="T1">T1</option>
                            <option value="T2">T2</option>
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="remarque-date"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Date
                        </label>
                        <input
                            id="remarque-date"
                            type="date"
                            value={dateRemarque}
                            onChange={(e) => setDateRemarque(e.target.value)}
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
                              ? 'Enregistrer la remarque'
                              : 'Ajouter la remarque'}
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

            {loading ? (
                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    Chargement...
                </p>
            ) : remarques.length === 0 ? (
                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    Aucune remarque enregistrée.
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
                                    Date
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Trimestre
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Contenu
                                </th>
                                <th className="px-3 py-2 text-right font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {remarques.map((remarque) => (
                                <tr
                                    key={remarque.id_remarque}
                                    className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]"
                                >
                                    <td className="px-3 py-2">
                                        {eleveName(remarque.id_eleve)}
                                    </td>
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
                                            onClick={() =>
                                                startEdit(remarque)
                                            }
                                            className="mr-4 text-sm font-medium text-[#f53003] hover:underline dark:text-[#FF4433]"
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
                                            className="text-sm font-medium text-[#706f6c] hover:text-[#f53003] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#A1A09A] dark:hover:text-[#FF4433]"
                                        >
                                            {deletingId ===
                                            remarque.id_remarque
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
