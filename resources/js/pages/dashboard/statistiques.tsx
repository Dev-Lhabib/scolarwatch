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

export default function DirectionStatistiques() {
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
            <h1 className="mb-6 text-xl font-medium text-slate-900 dark:text-slate-100">
                Statistiques
            </h1>

            <div className="rounded-lg bg-white p-6 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <h2 className="mb-4 text-base font-medium text-slate-900 dark:text-slate-100">
                    Élèves par classe
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={13} />
                        <YAxis stroke="#64748b" fontSize={13} allowDecimals={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #1e293b',
                                borderRadius: 8,
                                color: '#f1f5f9',
                                fontSize: 13,
                            }}
                        />
                        <Bar dataKey="élèves" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </AppLayout>
    );
}
