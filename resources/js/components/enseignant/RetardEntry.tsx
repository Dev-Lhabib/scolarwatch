import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Select from '@/components/ui/Select';
import { apiFetch } from '@/lib/auth';

type Eleve = {
    id_eleve: number;
    nom: string;
    prenom: string;
};

type Retard = {
    id_retard: number;
    date_retard: string;
    justifiee: boolean;
    minutes_retard: number;
    motif: string | null;
    id_eleve: number;
    id_utilisateur: number;
};

type Props = {
    eleves: Eleve[];
    authUserId: number;
    onChanged: () => void;
    refreshKey: number;
};

export default function RetardEntry({
    eleves,
    authUserId,
    onChanged,
    refreshKey,
}: Props) {
    const [retards, setRetards] = useState<Retard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [idEleve, setIdEleve] = useState('');
    const [dateRetard, setDateRetard] = useState(
        new Date().toISOString().slice(0, 10),
    );
    const [justifiee, setJustifiee] = useState(false);
    const [minutesRetard, setMinutesRetard] = useState('');
    const [motif, setMotif] = useState('');

    const eleveIds = useMemo(
        () => new Set(eleves.map((eleve) => eleve.id_eleve)),
        [eleves],
    );

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
                            eleveIds.has(retard.id_eleve),
                    ),
                );
            })
            .catch(() => {
                setError('Impossible de charger les retards.');
            })
            .finally(() => setLoading(false));
    }, [authUserId, eleveIds, refreshKey]);

    function eleveName(id: number): string {
        const eleve = eleves.find((item) => item.id_eleve === id);

        return eleve ? `${eleve.prenom} ${eleve.nom}` : '';
    }

    function resetForm() {
        setIdEleve('');
        setDateRetard(new Date().toISOString().slice(0, 10));
        setJustifiee(false);
        setMinutesRetard('');
        setMotif('');
    }

    function startEdit(retard: Retard) {
        setError(null);
        setSuccess(null);
        setEditingId(retard.id_retard);
        setIdEleve(String(retard.id_eleve));
        setDateRetard(String(retard.date_retard).slice(0, 10));
        setJustifiee(retard.justifiee);
        setMinutesRetard(String(retard.minutes_retard));
        setMotif(retard.motif ?? '');
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setProcessing(true);

        const payload: Record<string, string | number | boolean> = {
            date_retard: dateRetard,
            justifiee,
            minutes_retard: Number(minutesRetard),
            id_eleve: Number(idEleve),
        };

        if (motif !== '') {
            payload.motif = motif;
        }

        try {
            const response = await apiFetch(
                editingId != null
                    ? `/api/retards/${editingId}`
                    : '/api/retards',
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
                setRetards((current) =>
                    current.map((retard) =>
                        retard.id_retard === editingId
                            ? { ...retard, ...payload }
                            : retard,
                    ),
                );
                setSuccess('Retard modifié avec succès.');
            } else {
                setRetards((current) => [data, ...current]);
                setSuccess(
                    `Retard enregistré pour ${eleveName(payload.id_eleve as number)}.`,
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

    async function handleDelete(retard: Retard) {
        if (
            !window.confirm(
                `Supprimer le retard de ${eleveName(retard.id_eleve)} ?`,
            )
        ) {
            return;
        }

        setDeletingId(retard.id_retard);
        setError(null);

        try {
            const response = await apiFetch(
                `/api/retards/${retard.id_retard}`,
                { method: 'DELETE' },
            );

            if (!response.ok) {
                const data = await response.json();
                setError(
                    data.message ?? 'Erreur lors de la suppression.',
                );

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
        <div className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
            <h2 className="mb-4 text-base font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                Saisie des retards
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
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="retard-eleve"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Élève
                        </label>
                        <Select
                            id="retard-eleve"
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
                            htmlFor="retard-date"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Date
                        </label>
                        <input
                            id="retard-date"
                            type="date"
                            value={dateRetard}
                            onChange={(e) => setDateRetard(e.target.value)}
                            required
                            className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="retard-minutes"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Minutes de retard
                        </label>
                        <input
                            id="retard-minutes"
                            type="number"
                            value={minutesRetard}
                            onChange={(e) =>
                                setMinutesRetard(e.target.value)
                            }
                            required
                            min={1}
                            className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                        />
                    </div>
                    <div className="flex items-end pb-2">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                            <input
                                type="checkbox"
                                checked={justifiee}
                                onChange={(e) =>
                                    setJustifiee(e.target.checked)
                                }
                                className="h-4 w-4"
                            />
                            Retard justifié
                        </label>
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="retard-motif"
                        className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                    >
                        Motif
                    </label>
                    <input
                        id="retard-motif"
                        type="text"
                        value={motif}
                        onChange={(e) => setMotif(e.target.value)}
                        maxLength={255}
                        className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                    />
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
                              ? 'Enregistrer le retard'
                              : 'Ajouter le retard'}
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
            ) : retards.length === 0 ? (
                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    Aucun retard enregistré.
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
                                    Minutes
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Justifié
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Motif
                                </th>
                                <th className="px-3 py-2 text-right font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {retards.map((retard) => (
                                <tr
                                    key={retard.id_retard}
                                    className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]"
                                >
                                    <td className="px-3 py-2">
                                        {eleveName(retard.id_eleve)}
                                    </td>
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
                                            <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-xs text-green-700 dark:text-green-400">
                                                Justifié
                                            </span>
                                        ) : (
                                            <span className="rounded bg-[#f53003]/10 px-1.5 py-0.5 text-xs text-[#f53003] dark:text-[#FF4433]">
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
                                            onClick={() => startEdit(retard)}
                                            className="mr-4 text-sm font-medium text-[#f53003] hover:underline dark:text-[#FF4433]"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(retard)}
                                            disabled={
                                                deletingId === retard.id_retard
                                            }
                                            className="text-sm font-medium text-[#706f6c] hover:text-[#f53003] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#A1A09A] dark:hover:text-[#FF4433]"
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
        </div>
    );
}
