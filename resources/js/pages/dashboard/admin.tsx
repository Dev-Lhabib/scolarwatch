import { useEffect, useState } from 'react';
import { apiFetch, getAuthUser } from '@/lib/auth';
import AppLayout from '@/layouts/AppLayout';

type Classe = {
    id_classe: number;
    nom: string;
    niveau: string;
    professeurPrincipal?: {
        id: number;
        prenom: string;
        nom: string;
    } | null;
};

export default function AdminDashboard() {
    const [classes, setClasses] = useState<Classe[]>([]);
    const [matieresCount, setMatieresCount] = useState(0);
    const [elevesCount, setElevesCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = getAuthUser();
        if (!user || user.role !== 'admin') {
            window.location.href = '/login';
            return;
        }

        async function load() {
            try {
                const [classesRes, matieresRes, elevesRes] = await Promise.all([
                    apiFetch('/api/classes'),
                    apiFetch('/api/matieres'),
                    apiFetch('/api/eleves'),
                ]);

                const classesData = await classesRes.json();
                const matieresData = await matieresRes.json();
                const elevesData = await elevesRes.json();

                setClasses(classesData);
                setMatieresCount(Array.isArray(matieresData) ? matieresData.length : 0);
                setElevesCount(Array.isArray(elevesData) ? elevesData.length : 0);
            } catch {
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    if (loading) {
        return (
            <AppLayout>
                <div className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Chargement...</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                Tableau de bord administrateur
            </h1>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Classes</p>
                    <p className="mt-1 text-2xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                        {classes.length}
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Matières</p>
                    <p className="mt-1 text-2xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                        {matieresCount}
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Élèves</p>
                    <p className="mt-1 text-2xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                        {elevesCount}
                    </p>
                </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                <h2 className="mb-4 text-base font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                    Liste des classes
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                        <thead>
                            <tr className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                <th className="px-3 py-2 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Nom</th>
                                <th className="px-3 py-2 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Niveau</th>
                                <th className="px-3 py-2 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Professeur principal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map((classe) => (
                                <tr key={classe.id_classe} className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                    <td className="px-3 py-2">{classe.nom}</td>
                                    <td className="px-3 py-2">{classe.niveau}</td>
                                    <td className="px-3 py-2">
                                        {classe.professeurPrincipal
                                            ? `${classe.professeurPrincipal.prenom} ${classe.professeurPrincipal.nom}`
                                            : '—'}
                                    </td>
                                </tr>
                            ))}
                            {classes.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-3 py-4 text-center text-[#706f6c] dark:text-[#A1A09A]">
                                        Aucune classe trouvée.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
