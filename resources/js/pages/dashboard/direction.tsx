import { useEffect, useMemo, useState } from 'react';
import Accordion from '@/components/ui/Accordion';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type Classe = {
    id_classe: number;
    nom: string;
    niveau: string;
};

type Eleve = {
    id_eleve: number;
    nom: string;
    prenom: string;
    id_classe: number;
};

type Absence = {
    id_absence: number;
    id_eleve: number;
};

type Retard = {
    id_retard: number;
    id_eleve: number;
};

type EleveStat = {
    id_eleve: number;
    nom: string;
    prenom: string;
    classeNom: string;
    absences: number;
    retards: number;
};

type ClasseStat = {
    id_classe: number;
    nom: string;
    niveau: string;
    eleves: Eleve[];
    absences: number;
    retards: number;
};

export default function DirectionDashboard() {
    const [classes, setClasses] = useState<Classe[]>([]);
    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [retards, setRetards] = useState<Retard[]>([]);
    const [openClasseId, setOpenClasseId] = useState<number | null>(null);

    useEffect(() => {
        const user = getAuthUser();

        if (!user || user.role !== 'direction') {
            window.location.href = '/login';

            return;
        }

        async function load() {
            try {
                const [classesRes, elevesRes, absencesRes, retardsRes] =
                    await Promise.all([
                        apiFetch('/api/classes'),
                        apiFetch('/api/eleves'),
                        apiFetch('/api/absences'),
                        apiFetch('/api/retards'),
                    ]);

                const classesJson = await classesRes.json();
                const elevesJson = await elevesRes.json();
                const absencesJson = await absencesRes.json();
                const retardsJson = await retardsRes.json();

                const allClasses: Classe[] = Array.isArray(classesJson)
                    ? classesJson
                    : [];
                setClasses(allClasses);
                setOpenClasseId(allClasses[0]?.id_classe ?? null);
                setEleves(Array.isArray(elevesJson) ? elevesJson : []);
                setAbsences(Array.isArray(absencesJson) ? absencesJson : []);
                setRetards(Array.isArray(retardsJson) ? retardsJson : []);
            } catch {
                window.location.href = '/login';
            }
        }

        load();
    }, []);

    const classeMap = Object.fromEntries(
        classes.map((c) => [c.id_classe, c.nom]),
    );

    const statsParEleve = useMemo(() => {
        const stats = new Map<number, { absences: number; retards: number }>();

        for (const eleve of eleves) {
            stats.set(eleve.id_eleve, { absences: 0, retards: 0 });
        }

        for (const absence of absences) {
            const stat = stats.get(absence.id_eleve);

            if (stat) {
                stat.absences += 1;
            }
        }

        for (const retard of retards) {
            const stat = stats.get(retard.id_eleve);

            if (stat) {
                stat.retards += 1;
            }
        }

        return stats;
    }, [eleves, absences, retards]);

    const eleveStats: EleveStat[] = useMemo(() => {
        return eleves
            .map((eleve) => {
                const stat = statsParEleve.get(eleve.id_eleve) ?? {
                    absences: 0,
                    retards: 0,
                };

                return {
                    id_eleve: eleve.id_eleve,
                    nom: eleve.nom,
                    prenom: eleve.prenom,
                    classeNom:
                        classeMap[eleve.id_classe] ??
                        `Classe #${eleve.id_classe}`,
                    absences: stat.absences,
                    retards: stat.retards,
                };
            })
            .filter((stat) => stat.absences > 0 || stat.retards > 0)
            .sort((a, b) => b.absences - a.absences || b.retards - a.retards)
            .slice(0, 20);
    }, [eleves, classeMap, statsParEleve]);

    const classesWithStats: ClasseStat[] = useMemo(() => {
        return classes.map((classe) => {
            const elevesDeClasse = eleves.filter(
                (eleve) => eleve.id_classe === classe.id_classe,
            );
            let absencesTotal = 0;
            let retardsTotal = 0;

            for (const eleve of elevesDeClasse) {
                const stat = statsParEleve.get(eleve.id_eleve);
                absencesTotal += stat?.absences ?? 0;
                retardsTotal += stat?.retards ?? 0;
            }

            return {
                id_classe: classe.id_classe,
                nom: classe.nom,
                niveau: classe.niveau,
                eleves: elevesDeClasse,
                absences: absencesTotal,
                retards: retardsTotal,
            };
        });
    }, [classes, eleves, statsParEleve]);

    const totalAbsences = absences.length;
    const totalRetards = retards.length;

    function eleveCountLabel(count: number): string {
        return `${count} élève${count > 1 ? 's' : ''}`;
    }

    function absenceCountLabel(count: number): string {
        return `${count} absence${count > 1 ? 's' : ''}`;
    }

    function retardCountLabel(count: number): string {
        return `${count} retard${count > 1 ? 's' : ''}`;
    }

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-slate-900 dark:text-slate-100">
                Tableau de bord direction
            </h1>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
                <StatCard
                    label="Total classes"
                    value={String(classes.length)}
                />
                <StatCard label="Total élèves" value={String(eleves.length)} />
                <StatCard label="Absences" value={String(totalAbsences)} />
                <StatCard label="Retards" value={String(totalRetards)} />
            </div>

            <Card className="mb-8">
                <h2 className="mb-4 text-base font-medium text-slate-900 dark:text-slate-100">
                    Élèves les plus concernés
                </h2>
                {eleveStats.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Aucun élève concerné pour le moment.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                        Élève
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                        Classe
                                    </th>
                                    <th className="px-3 py-2 text-center font-medium text-slate-500 dark:text-slate-400">
                                        Absences
                                    </th>
                                    <th className="px-3 py-2 text-center font-medium text-slate-500 dark:text-slate-400">
                                        Retards
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {eleveStats.map((stat) => (
                                    <tr
                                        key={stat.id_eleve}
                                        className="border-b border-slate-200 dark:border-slate-800"
                                    >
                                        <td className="px-3 py-2">
                                            {stat.prenom} {stat.nom}
                                        </td>
                                        <td className="px-3 py-2">
                                            {stat.classeNom}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {stat.absences}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {stat.retards}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <section className="mb-8">
                <h2 className="mb-4 text-base font-medium text-slate-900 dark:text-slate-100">
                    Classes
                </h2>
                {classesWithStats.length === 0 ? (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                        Aucune classe disponible.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {classesWithStats.map((classe) => (
                            <Accordion
                                key={classe.id_classe}
                                id={classe.id_classe}
                                open={openClasseId === classe.id_classe}
                                onToggle={() =>
                                    setOpenClasseId(
                                        openClasseId === classe.id_classe
                                            ? null
                                            : classe.id_classe,
                                    )
                                }
                                title={classe.nom}
                                subtitle={
                                    <>
                                        <Badge tone="info">
                                            Niveau : {classe.niveau}
                                        </Badge>
                                        <Badge>
                                            {eleveCountLabel(
                                                classe.eleves.length,
                                            )}
                                        </Badge>
                                        <Badge>
                                            {absenceCountLabel(classe.absences)}
                                        </Badge>
                                        <Badge>
                                            {retardCountLabel(classe.retards)}
                                        </Badge>
                                    </>
                                }
                            >
                                {classe.eleves.length === 0 ? (
                                    <p className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                        Aucun élève dans cette classe.
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                                    <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                                        Nom
                                                    </th>
                                                    <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                                        Prénom
                                                    </th>
                                                    <th className="px-3 py-2 text-center font-medium text-slate-500 dark:text-slate-400">
                                                        Absences
                                                    </th>
                                                    <th className="px-3 py-2 text-center font-medium text-slate-500 dark:text-slate-400">
                                                        Retards
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {classe.eleves.map((eleve) => {
                                                    const stat =
                                                        statsParEleve.get(
                                                            eleve.id_eleve,
                                                        ) ?? {
                                                            absences: 0,
                                                            retards: 0,
                                                        };

                                                    return (
                                                        <tr
                                                            key={eleve.id_eleve}
                                                            className="border-b border-slate-200 dark:border-slate-800"
                                                        >
                                                            <td className="px-3 py-2">
                                                                {eleve.nom}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {eleve.prenom}
                                                            </td>
                                                            <td className="px-3 py-2 text-center">
                                                                {stat.absences}
                                                            </td>
                                                            <td className="px-3 py-2 text-center">
                                                                {stat.retards}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Accordion>
                        ))}
                    </div>
                )}
            </section>
        </AppLayout>
    );
}
