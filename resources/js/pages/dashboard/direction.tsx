import { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import { apiFetch, getAuthUser } from '@/lib/auth';
import AppLayout from '@/layouts/AppLayout';

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
    total: number;
};

type ClasseStat = {
    nom: string;
    absences: number;
    retards: number;
    total: number;
};

export default function DirectionDashboard() {
    const [classes, setClasses] = useState<Classe[]>([]);
    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [retards, setRetards] = useState<Retard[]>([]);

    useEffect(() => {
        const user = getAuthUser();
        if (!user || user.role !== 'direction') {
            window.location.href = '/login';
            return;
        }

        async function load() {
            try {
                const [classesRes, elevesRes, absencesRes, retardsRes] = await Promise.all([
                    apiFetch('/api/classes'),
                    apiFetch('/api/eleves'),
                    apiFetch('/api/absences'),
                    apiFetch('/api/retards'),
                ]);

                const classesJson = await classesRes.json();
                const elevesJson = await elevesRes.json();
                const absencesJson = await absencesRes.json();
                const retardsJson = await retardsRes.json();

                setClasses(Array.isArray(classesJson) ? classesJson : []);
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

    const eleveStats: EleveStat[] = useMemo(() => {
        return eleves.map((e) => {
            const abs = absences.filter((a) => a.id_eleve === e.id_eleve).length;
            const ret = retards.filter((r) => r.id_eleve === e.id_eleve).length;
            return {
                id_eleve: e.id_eleve,
                nom: e.nom,
                prenom: e.prenom,
                classeNom: classeMap[e.id_classe] ?? `Classe #${e.id_classe}`,
                absences: abs,
                retards: ret,
                total: abs + ret,
            };
        }).sort((a, b) => b.total - a.total).slice(0, 20);
    }, [eleves, absences, retards, classeMap]);

    const classeStats: ClasseStat[] = useMemo(() => {
        return classes.map((c) => {
            const ids = new Set(eleves.filter((e) => e.id_classe === c.id_classe).map((e) => e.id_eleve));
            const abs = absences.filter((a) => ids.has(a.id_eleve)).length;
            const ret = retards.filter((r) => ids.has(r.id_eleve)).length;
            return {
                nom: c.nom,
                absences: abs,
                retards: ret,
                total: abs + ret,
            };
        }).sort((a, b) => b.total - a.total);
    }, [classes, eleves, absences, retards]);

    const totalAbsences = absences.length;
    const totalRetards = retards.length;

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-slate-900 dark:text-slate-100">
                Tableau de bord direction
            </h1>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
                <StatCard label="Total classes" value={String(classes.length)} />
                <StatCard label="Total élèves" value={String(eleves.length)} />
                <StatCard label="Absences" value={String(totalAbsences)} />
                <StatCard label="Retards" value={String(totalRetards)} />
            </div>

            <div className="mb-8 space-y-8">
                <Card>
                    <h2 className="mb-4 text-base font-medium text-slate-900 dark:text-slate-100">
                        Élèves les plus concernés
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">Élève</th>
                                    <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">Classe</th>
                                    <th className="px-3 py-2 text-center font-medium text-slate-500 dark:text-slate-400">Absences</th>
                                    <th className="px-3 py-2 text-center font-medium text-slate-500 dark:text-slate-400">Retards</th>
                                </tr>
                            </thead>
                            <tbody>
                                {eleveStats.map((s) => (
                                    <tr key={s.id_eleve} className="border-b border-slate-200 dark:border-slate-800">
                                        <td className="px-3 py-2">{s.prenom} {s.nom}</td>
                                        <td className="px-3 py-2">{s.classeNom}</td>
                                        <td className="px-3 py-2 text-center">{s.absences}</td>
                                        <td className="px-3 py-2 text-center">{s.retards}</td>
                                    </tr>
                                ))}
                                {eleveStats.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-3 py-4 text-center text-slate-500 dark:text-slate-400">
                                            Aucune donnée.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card>
                    <h2 className="mb-4 text-base font-medium text-slate-900 dark:text-slate-100">
                        Classes les plus touchées
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">Classe</th>
                                    <th className="px-3 py-2 text-center font-medium text-slate-500 dark:text-slate-400">Absences</th>
                                    <th className="px-3 py-2 text-center font-medium text-slate-500 dark:text-slate-400">Retards</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classeStats.map((s) => (
                                    <tr key={s.nom} className="border-b border-slate-200 dark:border-slate-800">
                                        <td className="px-3 py-2">{s.nom}</td>
                                        <td className="px-3 py-2 text-center">{s.absences}</td>
                                        <td className="px-3 py-2 text-center">{s.retards}</td>
                                    </tr>
                                ))}
                                {classeStats.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-3 py-4 text-center text-slate-500 dark:text-slate-400">
                                            Aucune donnée.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
