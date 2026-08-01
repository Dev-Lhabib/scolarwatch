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
                    <h1 className="text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                        Gestion des classes
                    </h1>
                    <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        {classes.length} classe{classes.length > 1 ? 's' : ''}{' '}
                        enregistrée{classes.length > 1 ? 's' : ''}.
                    </p>
                </div>
                <a
                    href="/dashboard/admin/classes/create"
                    className="rounded-sm border border-black bg-[#1b1b18] px-4 py-2 text-sm font-medium text-white hover:border-black hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                >
                    Nouvelle classe
                </a>
            </div>

            {error && (
                <div className="mb-4 rounded border border-[#f53003]/30 bg-[#f53003]/10 px-3 py-2 text-sm text-[#f53003] dark:text-[#FF4433]">
                    {error}
                </div>
            )}

            <div className="mb-4 max-w-sm">
                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Rechercher une classe..."
                    className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                />
            </div>

            <div className="overflow-x-auto rounded-lg bg-white shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                <table className="w-full text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                    <thead>
                        <tr className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Nom
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Niveau
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Année
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Capacité
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Professeur principal
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClasses.map((classe) => (
                            <tr
                                key={classe.id_classe}
                                className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]"
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
                                        className="mr-4 text-sm font-medium text-[#f53003] hover:underline dark:text-[#FF4433]"
                                    >
                                        Modifier
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(classe)}
                                        disabled={deletingId === classe.id_classe}
                                        className="text-sm font-medium text-[#706f6c] hover:text-[#f53003] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#A1A09A] dark:hover:text-[#FF4433]"
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
                                    className="px-4 py-6 text-center text-[#706f6c] dark:text-[#A1A09A]"
                                >
                                    Aucune classe trouvée.
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-6 text-center text-[#706f6c] dark:text-[#A1A09A]"
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
