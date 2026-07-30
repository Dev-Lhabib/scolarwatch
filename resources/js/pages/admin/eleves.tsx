import { useEffect, useState } from 'react';
import { apiFetch, getAuthUser } from '@/lib/auth';
import AppLayout from '@/layouts/AppLayout';

type Eleve = {
    id_eleve: number;
    nom: string;
    prenom: string;
    genre: string;
    code_massar: string | null;
    id_classe: number;
};

type Classe = {
    id_classe: number;
    nom: string;
};

export default function AdminEleves() {
    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [classes, setClasses] = useState<Classe[]>([]);

    useEffect(() => {
        const user = getAuthUser();
        if (!user || user.role !== 'admin') {
            window.location.href = '/login';
            return;
        }

        async function load() {
            try {
                const [elevesRes, classesRes] = await Promise.all([
                    apiFetch('/api/eleves'),
                    apiFetch('/api/classes'),
                ]);
                setEleves(await elevesRes.json());
                setClasses(await classesRes.json());
            } catch {
                window.location.href = '/login';
            }
        }

        load();
    }, []);

    const classeMap = Object.fromEntries(
        classes.map((c) => [c.id_classe, c.nom]),
    );

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                Gestion des élèves
            </h1>

            <div className="overflow-x-auto rounded-lg bg-white shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                <table className="w-full text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                    <thead>
                        <tr className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Nom</th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Prénom</th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Classe</th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Genre</th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Code Massar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eleves.map((eleve) => (
                            <tr key={eleve.id_eleve} className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                <td className="px-4 py-3">{eleve.nom}</td>
                                <td className="px-4 py-3">{eleve.prenom}</td>
                                <td className="px-4 py-3">{classeMap[eleve.id_classe] ?? eleve.id_classe}</td>
                                <td className="px-4 py-3">{eleve.genre}</td>
                                <td className="px-4 py-3">{eleve.code_massar ?? '—'}</td>
                            </tr>
                        ))}
                        {eleves.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-[#706f6c] dark:text-[#A1A09A]">
                                    Aucun élève trouvé.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
