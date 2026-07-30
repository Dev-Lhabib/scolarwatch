import { useEffect, useState } from 'react';
import { apiFetch, getAuthUser } from '@/lib/auth';
import AppLayout from '@/layouts/AppLayout';

type Classe = {
    id_classe: number;
    nom: string;
    niveau: string;
};

type Eleve = {
    id_eleve: number;
    id_classe: number;
};

export default function DirectionDashboard() {
    const [classes, setClasses] = useState<Classe[]>([]);
    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [absencesCount, setAbsencesCount] = useState(0);
    const [retardsCount, setRetardsCount] = useState(0);

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

                const classesData = await classesRes.json();
                const elevesData = await elevesRes.json();

                setClasses(Array.isArray(classesData) ? classesData : []);
                setEleves(Array.isArray(elevesData) ? elevesData : []);

                const absencesData = await absencesRes.json();
                const retardsData = await retardsRes.json();

                setAbsencesCount(Array.isArray(absencesData) ? absencesData.length : 0);
                setRetardsCount(Array.isArray(retardsData) ? retardsData.length : 0);
            } catch {
                window.location.href = '/login';
            }
        }

        load();
    }, []);

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                Tableau de bord direction
            </h1>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Total classes</p>
                    <p className="mt-1 text-2xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                        {classes.length}
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Total élèves</p>
                    <p className="mt-1 text-2xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                        {eleves.length}
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Absences</p>
                    <p className="mt-1 text-2xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                        {absencesCount}
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Retards</p>
                    <p className="mt-1 text-2xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                        {retardsCount}
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
