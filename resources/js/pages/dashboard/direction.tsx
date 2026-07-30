import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

    useEffect(() => {
        const user = getAuthUser();
        if (!user || user.role !== 'direction') {
            window.location.href = '/login';
            return;
        }

        async function load() {
            try {
                const [classesRes, elevesRes] = await Promise.all([
                    apiFetch('/api/classes'),
                    apiFetch('/api/eleves'),
                ]);
                setClasses(await classesRes.json());
                setEleves(await elevesRes.json());
            } catch {
                window.location.href = '/login';
            }
        }

        load();
    }, []);

    const chartData = classes.map((c) => ({
        name: c.nom,
        élèves: eleves.filter((e) => e.id_classe === c.id_classe).length,
    }));

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                Tableau de bord direction
            </h1>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>

            <div className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                <h2 className="mb-4 text-base font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                    Élèves par classe
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e0" />
                        <XAxis dataKey="name" stroke="#706f6c" fontSize={13} />
                        <YAxis stroke="#706f6c" fontSize={13} allowDecimals={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#161615',
                                border: '1px solid #3E3E3A',
                                borderRadius: 8,
                                color: '#EDEDEC',
                                fontSize: 13,
                            }}
                        />
                        <Bar dataKey="élèves" fill="#1b1b18" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </AppLayout>
    );
}
