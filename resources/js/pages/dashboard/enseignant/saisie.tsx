import { useEffect, useState } from 'react';
import AbsenceEntry from '@/components/enseignant/AbsenceEntry';
import NoteEntry from '@/components/enseignant/NoteEntry';
import RemarqueEntry from '@/components/enseignant/RemarqueEntry';
import RetardEntry from '@/components/enseignant/RetardEntry';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type Classe = {
    id_classe: number;
    professeur_principal?: { id: number } | null;
    enseignants?: Array<{ id: number }>;
};

type Eleve = {
    id_eleve: number;
    nom: string;
    prenom: string;
    id_classe: number;
};

type Matiere = {
    id_matiere: number;
    nom: string;
};

export default function EnseignantSaisie() {
    const user = getAuthUser();

    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [matieres, setMatieres] = useState<Matiere[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

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
                const [classesRes, elevesRes, matieresRes] = await Promise.all([
                    apiFetch('/api/classes'),
                    apiFetch('/api/eleves'),
                    apiFetch('/api/matieres'),
                ]);

                const allClasses: Classe[] = await classesRes.json();
                const allEleves: Eleve[] = await elevesRes.json();
                const matieresJson: Matiere[] = await matieresRes.json();

                setClasses(allClasses);
                setEleves(allEleves);
                setMatieres(matieresJson);
            } catch {
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user]);

    const authUserId = user?.id ?? 0;
    const mesClasses = classes.filter(
        (classe) =>
            classe.professeur_principal?.id === authUserId ||
            classe.enseignants?.some((enseignant) => enseignant.id === authUserId),
    );
    const idsClasses = new Set(mesClasses.map((classe) => classe.id_classe));
    const mesEleves = eleves.filter((eleve) => idsClasses.has(eleve.id_classe));
    const classesOuEnseigne = classes.filter((classe) =>
        classe.enseignants?.some((enseignant) => enseignant.id === authUserId),
    );
    const noteEleves = eleves.filter((eleve) =>
        classesOuEnseigne.some((classe) => classe.id_classe === eleve.id_classe),
    );
    const maMatiere =
        matieres.find((matiere) => matiere.id_matiere === user?.id_matiere) ?? null;

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                Saisie
            </h1>

            {loading ? (
                <div className="space-y-6">
                    {[0, 1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]"
                        >
                            <div className="h-4 w-1/3 animate-pulse rounded bg-[#e3e3e0] dark:bg-[#3E3E3A]" />
                            <div className="mt-4 h-8 animate-pulse rounded bg-[#e3e3e0] dark:bg-[#3E3E3A]" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    <NoteEntry
                        eleves={noteEleves}
                        matiere={maMatiere}
                        authUserId={authUserId}
                        onChanged={() => setRefreshKey((key) => key + 1)}
                        refreshKey={refreshKey}
                    />

                    <AbsenceEntry
                        eleves={mesEleves}
                        authUserId={authUserId}
                        onChanged={() => setRefreshKey((key) => key + 1)}
                        refreshKey={refreshKey}
                    />

                    <RetardEntry
                        eleves={mesEleves}
                        authUserId={authUserId}
                        onChanged={() => setRefreshKey((key) => key + 1)}
                        refreshKey={refreshKey}
                    />

                    <RemarqueEntry
                        eleves={mesEleves}
                        authUserId={authUserId}
                        onChanged={() => setRefreshKey((key) => key + 1)}
                        refreshKey={refreshKey}
                    />
                </div>
            )}
        </AppLayout>
    );
}
