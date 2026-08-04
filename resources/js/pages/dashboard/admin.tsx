import { useEffect, useState } from 'react';
import StatCard from '@/components/ui/StatCard';
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
                <StatCard label="Classes" value={String(classesCount)} />
                <StatCard label="Matières" value={String(matieresCount)} />
                <StatCard label="Élèves" value={String(elevesCount)} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Total utilisateurs" value={String(totalUsers)} />
                <StatCard label="Enseignants" value={String(enseignantsCount)} />
                <StatCard label="Direction" value={String(directionCount)} />
            </div>
        </AppLayout>
    );
}
