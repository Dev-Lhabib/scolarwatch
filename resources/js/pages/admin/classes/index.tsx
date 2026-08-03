import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type Classe = {
    id_classe: number;
    nom: string;
    niveau: string;
    annee_scolaire: string;
    capacite: number;
    professeur_principal?: {
        id: number;
        prenom: string;
        nom: string;
    } | null;
};

export default function AdminClassesIndex() {
    const [classes, setClasses] = useState<Classe[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const user = getAuthUser();

        if (!user || user.role !== 'admin') {
            window.location.href = '/login';

            return;
        }

        apiFetch('/api/classes')
            .then(async (response) => {
                setError(null);
                const data = await response.json();

                if (!response.ok) {
                    setError(
                        data.message ??
                            'Erreur lors du chargement des classes.',
                    );

                    return;
                }

                setClasses(data);
            })
            .catch(() => {
                setError(
                    'Impossible de charger les classes. Vérifiez votre connexion.',
                );
            })
            .finally(() => setLoading(false));
    }, [refreshKey]);

    async function handleDelete(classe: Classe) {
        if (!window.confirm(`Supprimer la classe « ${classe.nom} » ?`)) {
            return;
        }

        setDeletingId(classe.id_classe);
        setError(null);

        try {
            const response = await apiFetch(
                `/api/classes/${classe.id_classe}`,
                { method: 'DELETE' },
            );

            if (!response.ok) {
                const data = await response.json();
                setError(
                    data.message ??
                        'Erreur lors de la suppression de la classe.',
                );

                return;
            }

            setRefreshKey((key) => key + 1);
        } catch {
            setError('Une erreur est survenue lors de la suppression.');
        } finally {
            setDeletingId(null);
        }
    }

    const filteredClasses = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return classes;
        }

        return classes.filter((classe) =>
            [classe.nom, classe.niveau, classe.annee_scolaire]
                .join(' ')
                .toLowerCase()
                .includes(query),
        );
    }, [classes, search]);

    return (
        <AppLayout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-medium text-slate-900 dark:text-slate-100">
                        Gestion des classes
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {classes.length} classe{classes.length > 1 ? 's' : ''}{' '}
                        enregistrée{classes.length > 1 ? 's' : ''}.
                    </p>
                </div>
                <a
                    href="/dashboard/admin/classes/create"
                    className="rounded-sm border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:border-indigo-700 hover:bg-indigo-700 dark:border-indigo-500 dark:bg-indigo-500 dark:text-white dark:hover:border-indigo-400 dark:hover:bg-indigo-400"
                >
                    Nouvelle classe
                </a>
            </div>

            {error && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="mb-4 max-w-sm">
                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Rechercher une classe..."
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
            </div>

            <div className="overflow-x-auto rounded-lg bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800">
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Nom
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Niveau
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Année
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Capacité
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                                Professeur principal
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClasses.map((classe) => (
                            <tr
                                key={classe.id_classe}
                                className="border-b border-slate-200 dark:border-slate-800"
                            >
                                <td className="px-4 py-3">{classe.nom}</td>
                                <td className="px-4 py-3">{classe.niveau}</td>
                                <td className="px-4 py-3">
                                    {classe.annee_scolaire}
                                </td>
                                <td className="px-4 py-3">{classe.capacite}</td>
                                <td className="px-4 py-3">
                                    {classe.professeur_principal
                                        ? `${classe.professeur_principal.prenom} ${classe.professeur_principal.nom}`
                                        : '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <a
                                        href={`/dashboard/admin/classes/${classe.id_classe}`}
                                        className="mr-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                    >
                                        Modifier
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(classe)}
                                        disabled={deletingId === classe.id_classe}
                                        className="text-sm font-medium text-slate-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-red-400"
                                    >
                                        {deletingId === classe.id_classe
                                            ? 'Suppression...'
                                            : 'Supprimer'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && filteredClasses.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-6 text-center text-slate-500 dark:text-slate-400"
                                >
                                    Aucune classe trouvée.
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-6 text-center text-slate-500 dark:text-slate-400"
                                >
                                    Chargement...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
