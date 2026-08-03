import { useEffect, useState } from 'react';
import { apiFetch, getAuthUser } from '@/lib/auth';
import AppLayout from '@/layouts/AppLayout';

type User = {
    id: number;
    nom: string;
    prenom: string;
    role: string;
};

export default function AdminDashboard() {
    const [classesCount, setClassesCount] = useState(0);
    const [matieresCount, setMatieresCount] = useState(0);
    const [elevesCount, setElevesCount] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [enseignantsCount, setEnseignantsCount] = useState(0);
    const [directionCount, setDirectionCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = getAuthUser();
        if (!user || user.role !== 'admin') {
            window.location.href = '/login';
            return;
        }

        async function load() {
            try {
                const [classesRes, matieresRes, elevesRes, usersRes] = await Promise.all([
                    apiFetch('/api/classes'),
                    apiFetch('/api/matieres'),
                    apiFetch('/api/eleves'),
                    apiFetch('/api/users'),
                ]);

                const classesData = await classesRes.json();
                const matieresData = await matieresRes.json();
                const elevesData = await elevesRes.json();
                const usersData: User[] = await usersRes.json();

                setClassesCount(Array.isArray(classesData) ? classesData.length : 0);
                setMatieresCount(Array.isArray(matieresData) ? matieresData.length : 0);
                setElevesCount(Array.isArray(elevesData) ? elevesData.length : 0);
                setTotalUsers(Array.isArray(usersData) ? usersData.length : 0);
                setEnseignantsCount(Array.isArray(usersData) ? usersData.filter((u) => u.role === 'enseignant').length : 0);
                setDirectionCount(Array.isArray(usersData) ? usersData.filter((u) => u.role === 'direction').length : 0);
            } catch {
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    if (loading) {
        return (
            <AppLayout>
                <div className="text-sm text-slate-500 dark:text-slate-400">Chargement...</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-slate-900 dark:text-slate-100">
                Tableau de bord administrateur
            </h1>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-white p-6 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Classes</p>
                    <p className="mt-1 text-2xl font-medium text-slate-900 dark:text-slate-100">
                        {classesCount}
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Matières</p>
                    <p className="mt-1 text-2xl font-medium text-slate-900 dark:text-slate-100">
                        {matieresCount}
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Élèves</p>
                    <p className="mt-1 text-2xl font-medium text-slate-900 dark:text-slate-100">
                        {elevesCount}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-white p-6 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total utilisateurs</p>
                    <p className="mt-1 text-2xl font-medium text-slate-900 dark:text-slate-100">
                        {totalUsers}
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Enseignants</p>
                    <p className="mt-1 text-2xl font-medium text-slate-900 dark:text-slate-100">
                        {enseignantsCount}
                    </p>
                </div>
                <div className="rounded-lg bg-white p-6 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Direction</p>
                    <p className="mt-1 text-2xl font-medium text-slate-900 dark:text-slate-100">
                        {directionCount}
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
