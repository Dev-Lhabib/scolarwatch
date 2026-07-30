import { useEffect, useState } from 'react';
import { apiFetch, getAuthUser } from '@/lib/auth';
import AppLayout from '@/layouts/AppLayout';

type Matiere = {
    id_matiere: number;
    nom: string;
    code: string;
};

export default function AdminMatieres() {
    const [matieres, setMatieres] = useState<Matiere[]>([]);

    useEffect(() => {
        const user = getAuthUser();
        if (!user || user.role !== 'admin') {
            window.location.href = '/login';
            return;
        }

        apiFetch('/api/matieres')
            .then((r) => r.json())
            .then(setMatieres)
            .catch(() => { window.location.href = '/login'; });
    }, []);

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                Gestion des matières
            </h1>

            <div className="overflow-x-auto rounded-lg bg-white shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                <table className="w-full text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                    <thead>
                        <tr className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Nom</th>
                            <th className="px-4 py-3 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Code</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matieres.map((matiere) => (
                            <tr key={matiere.id_matiere} className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                <td className="px-4 py-3">{matiere.nom}</td>
                                <td className="px-4 py-3">{matiere.code}</td>
                            </tr>
                        ))}
                        {matieres.length === 0 && (
                            <tr>
                                <td colSpan={2} className="px-4 py-6 text-center text-[#706f6c] dark:text-[#A1A09A]">
                                    Aucune matière trouvée.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
