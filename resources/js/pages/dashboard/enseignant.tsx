import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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
    valeur: number;
    id_eleve: number;
};

const cardClass =
    'block rounded-lg border border-slate-200 bg-white p-6 transition hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500';

type StatCardProps = {
    href: string;
    label: string;
    value: string;
    hint: string;
};

function StatCard({ href, label, value, hint }: StatCardProps) {
    return (
        <Link href={href} className={cardClass}>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-medium text-slate-900 dark:text-slate-100">{value}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        </Link>
    );
}

function StatSkeleton() {
    return (
        <div className="rounded-lg bg-white p-6 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-2 h-6 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
    );
}

export default function EnseignantDashboard() {
    const user = getAuthUser();

    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [retards, setRetards] = useState<Retard[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [remarques, setRemarques] = useState<Remarque[]>([]);

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
                const [classesRes, elevesRes, absencesRes, retardsRes, notesRes, remarquesRes] =
                    await Promise.all([
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
                        classe.enseignants?.some((enseignant) => enseignant.id === authUserId),
                );
                const idsClasses = new Set(mesClasses.map((classe) => classe.id_classe));
                const mesEleves = allEleves.filter((eleve) => idsClasses.has(eleve.id_classe));
                const idsEleves = new Set(mesEleves.map((eleve) => eleve.id_eleve));

                setClasses(mesClasses);
                setEleves(mesEleves);
                setAbsences(absencesJson.filter((absence) => idsEleves.has(absence.id_eleve)));
                setRetards(retardsJson.filter((retard) => idsEleves.has(retard.id_eleve)));
                setNotes(notesJson.filter((note) => idsEleves.has(note.id_eleve)));
                setRemarques(remarquesJson.filter((remarque) => idsEleves.has(remarque.id_eleve)));
            } catch {
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user]);

    const totalMinutesRetards = retards.reduce((sum, retard) => sum + retard.minutes_retard, 0);
    const moyenneGenerale =
        notes.length > 0
            ? `${(notes.reduce((sum, note) => sum + note.valeur, 0) / notes.length).toFixed(2).replace('.', ',')}/20`
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
                    <StatSkeleton />
                    <StatSkeleton />
                    <StatSkeleton />
                    <StatSkeleton />
                    <StatSkeleton />
                    <StatSkeleton />
                    <StatSkeleton />
                    <StatSkeleton />
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
                        label="Prof principal"
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
                        label="Absences"
                        value={String(absences.length)}
                        hint="Saisir les absences"
                    />
                    <StatCard
                        href="/dashboard/enseignant/saisie"
                        label="Retards"
                        value={`${String(retards.length)} · ${String(totalMinutesRetards)} min`}
                        hint="Saisir les retards"
                    />
                    <StatCard
                        href="/dashboard/enseignant/saisie"
                        label="Notes"
                        value={String(notes.length)}
                        hint="Saisir les notes"
                    />
                    <StatCard
                        href="/dashboard/enseignant/saisie"
                        label="Remarques"
                        value={String(remarques.length)}
                        hint="Saisir les remarques"
                    />
                    <StatCard
                        href="/dashboard/enseignant/classes"
                        label="Moyenne générale"
                        value={moyenneGenerale}
                        hint="T1 et T2"
                    />
                </div>
            )}
        </AppLayout>
    );
}
