import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type Eleve = {
    id_eleve: number;
    nom: string;
    prenom: string;
    genre: string;
    date_naissance: string;
    code_massar: string | null;
    id_classe: number;
};

type Classe = {
    id_classe: number;
    nom: string;
};

export default function AdminElevesIndex() {
    const [eleves, setEleves] = useState<Eleve[]>([]);
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

        Promise.all([apiFetch('/api/eleves'), apiFetch('/api/classes')])
            .then(async ([elevesRes, classesRes]) => {
                setError(null);
                const elevesData = await elevesRes.json();

                if (!elevesRes.ok) {
                    setError(
                        elevesData.message ??
                            'Erreur lors du chargement des élèves.',
                    );

                    return;
                }

                const classesData = await classesRes.json();
                setEleves(elevesData);
                setClasses(Array.isArray(classesData) ? classesData : []);
            })
            .catch(() => {
                setError(
                    'Impossible de charger les élèves. Vérifiez votre connexion.',
                );
            })
            .finally(() => setLoading(false));
    }, [refreshKey]);

    async function handleDelete(eleve: Eleve) {
        if (
            !window.confirm(
                `Supprimer l'élève « ${eleve.prenom} ${eleve.nom} » ?`,
            )
        ) {
            return;
        }

        setDeletingId(eleve.id_eleve);
        setError(null);

        try {
            const response = await apiFetch(`/api/eleves/${eleve.id_eleve}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                setError(
                    data.message ??
                        'Erreur lors de la suppression de l\'élève.',
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

    const classeMap = useMemo(
        () =>
            Object.fromEntries(
                classes.map((classe) => [classe.id_classe, classe.nom]),
            ),
        [classes],
    );

    const filteredEleves = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return eleves;
        }

        return eleves.filter((eleve) =>
            [eleve.nom, eleve.prenom, eleve.code_massar ?? '']
                .join(' ')
                .toLowerCase()
                .includes(query),
        );
    }, [eleves, search]);

    return (
        <AppLayout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                        Gestion des élèves
                    </h1>
                    <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        {eleves.length} élève{eleves.length > 1 ? 's' : ''}{' '}
                        enregistré{eleves.length > 1 ? 's' : ''}.
                    </p>
                </div>
                <a
                    href="/dashboard/admin/eleves/create"
                    className="rounded-sm border border-black bg-[#1b1b18] px-4 py-2 text-sm font-medium text-white hover:border-black hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                >
                    Nouvel élève
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
                    placeholder="Rechercher un élève..."
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
                                Prénom
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Classe
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Genre
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Date de naissance
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Code Massar
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEleves.map((eleve) => (
                            <tr
                                key={eleve.id_eleve}
                                className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]"
                            >
                                <td className="px-4 py-3">{eleve.nom}</td>
                                <td className="px-4 py-3">{eleve.prenom}</td>
                                <td className="px-4 py-3">
                                    {classeMap[eleve.id_classe] ??
                                        eleve.id_classe}
                                </td>
                                <td className="px-4 py-3">
                                    {eleve.genre === 'M'
                                        ? 'Masculin'
                                        : 'Féminin'}
                                </td>
                                <td className="px-4 py-3">
                                    {String(eleve.date_naissance).slice(0, 10)}
                                </td>
                                <td className="px-4 py-3">
                                    {eleve.code_massar ?? '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <a
                                        href={`/dashboard/admin/eleves/${eleve.id_eleve}`}
                                        className="mr-4 text-sm font-medium text-[#f53003] hover:underline dark:text-[#FF4433]"
                                    >
                                        Modifier
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(eleve)}
                                        disabled={deletingId === eleve.id_eleve}
                                        className="text-sm font-medium text-[#706f6c] hover:text-[#f53003] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#A1A09A] dark:hover:text-[#FF4433]"
                                    >
                                        {deletingId === eleve.id_eleve
                                            ? 'Suppression...'
                                            : 'Supprimer'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && filteredEleves.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-6 text-center text-[#706f6c] dark:text-[#A1A09A]"
                                >
                                    Aucun élève trouvé.
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td
                                    colSpan={7}
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
