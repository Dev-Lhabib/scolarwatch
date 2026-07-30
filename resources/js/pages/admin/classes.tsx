import { useEffect, useState } from 'react';
import { apiFetch, getAuthUser } from '@/lib/auth';
import AppLayout from '@/layouts/AppLayout';

type Classe = {
    id_classe: number;
    nom: string;
    niveau: string;
    annee_scolaire: string;
    capacite: number;
    professeurPrincipal?: {
        id: number;
        prenom: string;
        nom: string;
    } | null;
};

export default function AdminClasses() {
    const [classes, setClasses] = useState<Classe[]>([]);

    useEffect(() => {
        const user = getAuthUser();
        if (!user || user.role !== 'admin') {
            window.location.href = '/login';
            return;
        }

        apiFetch('/api/classes')
            .then((r) => r.json())
            .then(setClasses)
            .catch(() => { window.location.href = '/login'; });
    }, []);

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                Gestion des classes
            </h1>

            <div className="overflow-x-auto rounded-lg bg-white shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                <table className="w-full text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                    <thead>
                        <tr className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Nom</th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Niveau</th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Année</th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Capacité</th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Professeur principal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map((classe) => (
                            <tr key={classe.id_classe} className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                <td className="px-4 py-3">{classe.nom}</td>
                                <td className="px-4 py-3">{classe.niveau}</td>
                                <td className="px-4 py-3">{classe.annee_scolaire}</td>
                                <td className="px-4 py-3">{classe.capacite}</td>
                                <td className="px-4 py-3">
                                    {classe.professeurPrincipal
                                        ? `${classe.professeurPrincipal.prenom} ${classe.professeurPrincipal.nom}`
                                        : '—'}
                                </td>
                            </tr>
                        ))}
                        {classes.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-[#706f6c] dark:text-[#A1A09A]">
                                    Aucune classe trouvée.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
