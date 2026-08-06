import { useEffect, useState } from 'react';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import StatCard from '@/components/ui/StatCard';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type Classe = {
    id_classe: number;
    professeur_principal?: { id: number } | null;
    enseignants?: Array<{ id: number }>;
};

type Eleve = {
    id_eleve: number;
    id_classe: number;
};

type Absence = {
    id_absence: number;
    id_eleve: number;
};

type Retard = {
    id_retard: number;
    id_eleve: number;
    minutes_retard: number;
};

type Remarque = {
    id_remarque: number;
    id_eleve: number;
};

type Note = {
    id_note: number;
    valeur: string;
    id_eleve: number;
    id_matiere: number;
};

export default function EnseignantDashboard() {
    const user = getAuthUser();
    const userId = user?.id ?? null;
    const userMatiereId = user?.id_matiere ?? null;
    const isEnseignant = user?.role === 'enseignant';

    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [retards, setRetards] = useState<Retard[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [remarques, setRemarques] = useState<Remarque[]>([]);

    useEffect(() => {
        if (!isEnseignant) {
            window.location.href = '/login';

            return;
        }

        if (userId == null) {
            return;
        }

        async function load() {
            const authUserId = userId;

            try {
                const [
                    classesRes,
                    elevesRes,
                    absencesRes,
                    retardsRes,
                    notesRes,
                    remarquesRes,
                ] = await Promise.all([
                    apiFetch('/api/classes'),
                    apiFetch('/api/eleves'),
                    apiFetch('/api/absences'),
                    apiFetch('/api/retards'),
                    apiFetch('/api/notes'),
                    apiFetch('/api/remarques'),
                ]);

                const allClasses: Classe[] = await classesRes.json();
                const allEleves: Eleve[] = await elevesRes.json();
                const absencesJson: Absence[] = await absencesRes.json();
                const retardsJson: Retard[] = await retardsRes.json();
                const notesJson: Note[] = await notesRes.json();
                const remarquesJson: Remarque[] = await remarquesRes.json();

                const mesClasses = allClasses.filter(
                    (classe) =>
                        classe.professeur_principal?.id === authUserId ||
                        classe.enseignants?.some(
                            (enseignant) => enseignant.id === authUserId,
                        ),
                );
                const idsClasses = new Set(
                    mesClasses.map((classe) => classe.id_classe),
                );
                const mesEleves = allEleves.filter((eleve) =>
                    idsClasses.has(eleve.id_classe),
                );
                const idsEleves = new Set(
                    mesEleves.map((eleve) => eleve.id_eleve),
                );

                setClasses(mesClasses);
                setEleves(mesEleves);
                setAbsences(
                    absencesJson.filter((absence) =>
                        idsEleves.has(absence.id_eleve),
                    ),
                );
                setRetards(
                    retardsJson.filter((retard) =>
                        idsEleves.has(retard.id_eleve),
                    ),
                );
                setNotes(
                    notesJson.filter(
                        (note) =>
                            idsEleves.has(note.id_eleve) &&
                            note.id_matiere === userMatiereId,
                    ),
                );
                setRemarques(
                    remarquesJson.filter((remarque) =>
                        idsEleves.has(remarque.id_eleve),
                    ),
                );
            } catch {
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [isEnseignant, userId, userMatiereId]);

    const totalMinutesRetards = retards.reduce(
        (sum, retard) => sum + retard.minutes_retard,
        0,
    );
    const moyenneGenerale =
        notes.length > 0
            ? `${(notes.reduce((sum, note) => sum + Number(note.valeur), 0) / notes.length).toFixed(2).replace('.', ',')}/20`
            : '—';
    const nbClassesPrincipales = classes.filter(
        (classe) => classe.professeur_principal?.id === user?.id,
    ).length;

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-slate-900 dark:text-slate-100">
                Tableau de bord
            </h1>

            {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        href="/dashboard/enseignant/classes"
                        label="Classes assignées"
                        value={String(classes.length)}
                        hint="Gérer mes classes"
                    />
                    <StatCard
                        href="/dashboard/enseignant/classes"
                        label="Classes principales"
                        value={String(nbClassesPrincipales)}
                        hint="Voir les élèves"
                    />
                    <StatCard
                        href="/dashboard/enseignant/classes"
                        label="Élèves"
                        value={String(eleves.length)}
                        hint="Consulter les fiches"
                    />
                    <StatCard
                        href="/dashboard/enseignant/saisie"
                        label="Absences saisies"
                        value={String(absences.length)}
                        hint="Saisir les absences"
                    />
                    <StatCard
                        href="/dashboard/enseignant/saisie"
                        label="Retards saisis"
                        value={`${String(retards.length)} · ${String(totalMinutesRetards)} min`}
                        hint="Saisir les retards"
                    />
                    <StatCard
                        href="/dashboard/enseignant/saisie"
                        label="Évaluations saisies"
                        value={String(notes.length)}
                        hint="Saisir les notes"
                    />
                    <StatCard
                        href="/dashboard/enseignant/saisie"
                        label="Remarques saisies"
                        value={String(remarques.length)}
                        hint="Saisir les remarques"
                    />
                    <StatCard
                        href="/dashboard/enseignant/classes"
                        label="Moyenne générale"
                        value={moyenneGenerale}
                        hint="Moyenne des notes saisies dans votre matière (toutes classes et trimestres confondues)"
                    />
                </div>
            )}
        </AppLayout>
    );
}
