import { useEffect, useState } from 'react';
import SyntheseEntry from '@/components/enseignant/SyntheseEntry';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type Classe = {
    id_classe: number;
    nom: string;
    niveau: string;
    professeur_principal?: { id: number } | null;
};

type Eleve = {
    id_eleve: number;
    nom: string;
    prenom: string;
    id_classe: number;
};

export default function EnseignantSyntheses() {
    const user = getAuthUser();

    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'enseignant') {
            window.location.href = '/login';

            return;
        }

        async function load() {
            const authUserId = user?.id;

            if (authUserId == null) {
                return;
            }

            try {
                const [classesRes, elevesRes] = await Promise.all([
                    apiFetch('/api/classes'),
                    apiFetch('/api/eleves'),
                ]);

                const allClasses: Classe[] = await classesRes.json();
                const allEleves: Eleve[] = await elevesRes.json();

                setClasses(allClasses);
                setEleves(allEleves);
            } catch {
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user]);

    const authUserId = user?.id ?? 0;
    const classesPrincipales = classes.filter(
        (classe) => classe.professeur_principal?.id === authUserId,
    );
    const idsClasses = new Set(classesPrincipales.map((classe) => classe.id_classe));
    const elevesPrincipaux = eleves.filter((eleve) =>
        idsClasses.has(eleve.id_classe),
    );
    const classesWithEleves = classesPrincipales.map((classe) => ({
        ...classe,
        eleves: elevesPrincipaux.filter((eleve) => eleve.id_classe === classe.id_classe),
    }));

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                Synthèses IA
            </h1>

            {loading ? (
                <div className="space-y-6">
                    {[0, 1].map((item) => (
                        <div
                            key={item}
                            className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]"
                        >
                            <div className="h-4 w-1/3 animate-pulse rounded bg-[#e3e3e0] dark:bg-[#3E3E3A]" />
                            <div className="mt-4 h-8 animate-pulse rounded bg-[#e3e3e0] dark:bg-[#3E3E3A]" />
                        </div>
                    ))}
                </div>
            ) : classesWithEleves.length === 0 ? (
                <div className="rounded-lg bg-white p-6 text-center text-sm text-[#706f6c] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:text-[#A1A09A] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                    Aucune classe dont vous êtes professeur principal.
                </div>
            ) : (
                <div className="space-y-6">
                    {classesWithEleves.map((classe) => (
                        <div
                            key={classe.id_classe}
                            className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]"
                        >
                            <h2 className="mb-4 text-base font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                {classe.nom} — {classe.niveau}
                            </h2>

                            {classe.eleves.length === 0 ? (
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    Aucun élève dans cette classe.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                        <thead>
                                            <tr className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                                <th className="px-3 py-2 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Nom</th>
                                                <th className="px-3 py-2 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Prénom</th>
                                                <th className="px-3 py-2 text-right font-medium text-[#706f6c] dark:text-[#A1A09A]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classe.eleves.map((eleve) => (
                                                <tr
                                                    key={eleve.id_eleve}
                                                    className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]"
                                                >
                                                    <td className="px-3 py-2">{eleve.nom}</td>
                                                    <td className="px-3 py-2">{eleve.prenom}</td>
                                                    <td className="px-3 py-2 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedEleve(eleve)
                                                            }
                                                            className="rounded-sm border border-[#706f6c] px-3 py-1 text-xs font-medium text-[#706f6c] hover:border-[#1b1b18] hover:text-[#1b1b18] dark:border-[#A1A09A] dark:text-[#A1A09A] dark:hover:border-[#EDEDEC] dark:hover:text-[#EDEDEC]"
                                                        >
                                                            Voir la synthèse
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {selectedEleve && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-12"
                    onClick={() => setSelectedEleve(null)}
                >
                    <div
                        className="mx-4 w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-[#161615]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                {selectedEleve.prenom} {selectedEleve.nom}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setSelectedEleve(null)}
                                className="text-sm text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                            >
                                Fermer
                            </button>
                        </div>

                        <SyntheseEntry eleve={selectedEleve} />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
