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
            <h1 className="mb-6 text-xl font-medium text-slate-900 dark:text-slate-100">
                Synthèses IA
            </h1>

            {loading ? (
                <div className="space-y-6">
                    {[0, 1].map((item) => (
                        <div
                            key={item}
                            className="rounded-lg bg-white p-6 border border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                        >
                            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="mt-4 h-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                        </div>
                    ))}
                </div>
            ) : classesWithEleves.length === 0 ? (
                <div className="rounded-lg bg-white p-6 text-center text-sm text-slate-500 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800">
                    Aucune classe dont vous êtes professeur principal.
                </div>
            ) : (
                <div className="space-y-6">
                    {classesWithEleves.map((classe) => (
                        <div
                            key={classe.id_classe}
                            className="rounded-lg bg-white p-6 border border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                        >
                            <h2 className="mb-4 text-base font-medium text-slate-900 dark:text-slate-100">
                                {classe.nom} — {classe.niveau}
                            </h2>

                            {classe.eleves.length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Aucun élève dans cette classe.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">Nom</th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">Prénom</th>
                                                <th className="px-3 py-2 text-right font-medium text-slate-500 dark:text-slate-400">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classe.eleves.map((eleve) => (
                                                <tr
                                                    key={eleve.id_eleve}
                                                    className="border-b border-slate-200 dark:border-slate-800"
                                                >
                                                    <td className="px-3 py-2">{eleve.nom}</td>
                                                    <td className="px-3 py-2">{eleve.prenom}</td>
                                                    <td className="px-3 py-2 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedEleve(eleve)
                                                            }
                                                            className="rounded-sm border border-slate-400 px-3 py-1 text-xs font-medium text-slate-500 hover:border-slate-900 hover:text-slate-900 dark:border-slate-600 dark:text-slate-400 dark:hover:border-slate-100 dark:hover:text-slate-100"
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
                        className="mx-4 w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-slate-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                                {selectedEleve.prenom} {selectedEleve.nom}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setSelectedEleve(null)}
                                className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
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
