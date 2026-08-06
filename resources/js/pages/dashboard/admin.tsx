import { useEffect, useMemo, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type User = {
    id: number;
    nom: string;
    prenom: string;
    role: 'admin' | 'enseignant' | 'direction' | 'parent';
    created_at?: string | null;
};

type Classe = {
    id_classe: number;
    nom: string;
    niveau: string;
    created_at?: string | null;
};

const ROLE_LABELS: Record<User['role'], string> = {
    admin: 'Administrateur',
    enseignant: 'Enseignant',
    direction: 'Direction',
    parent: 'Parent',
};

const ROLE_TONES: Record<
    User['role'],
    'default' | 'info' | 'success' | 'warning' | 'danger'
> = {
    admin: 'info',
    enseignant: 'default',
    direction: 'warning',
    parent: 'success',
};

function compareByCreatedDesc(
    a: { created_at?: string | null },
    b: { created_at?: string | null },
): number {
    return String(b.created_at ?? '').localeCompare(String(a.created_at ?? ''));
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [matieresCount, setMatieresCount] = useState(0);
    const [elevesCount, setElevesCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = getAuthUser();

        if (!user || user.role !== 'admin') {
            window.location.href = '/login';

            return;
        }

        async function load() {
            try {
                const [classesRes, matieresRes, elevesRes, usersRes] =
                    await Promise.all([
                        apiFetch('/api/classes'),
                        apiFetch('/api/matieres'),
                        apiFetch('/api/eleves'),
                        apiFetch('/api/users'),
                    ]);

                const classesData = await classesRes.json();
                const matieresData = await matieresRes.json();
                const elevesData = await elevesRes.json();
                const usersData: User[] = await usersRes.json();

                setClasses(Array.isArray(classesData) ? classesData : []);
                setMatieresCount(
                    Array.isArray(matieresData) ? matieresData.length : 0,
                );
                setElevesCount(
                    Array.isArray(elevesData) ? elevesData.length : 0,
                );
                setUsers(Array.isArray(usersData) ? usersData : []);
            } catch {
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    const enseignantsCount = users.filter(
        (user) => user.role === 'enseignant',
    ).length;
    const directionCount = users.filter(
        (user) => user.role === 'direction',
    ).length;
    const totalUsers = users.length;

    const distribution = useMemo(
        () => [
            {
                label: 'Administrateurs',
                count: users.filter((user) => user.role === 'admin').length,
            },
            { label: 'Direction', count: directionCount },
            { label: 'Enseignants', count: enseignantsCount },
            {
                label: 'Parents',
                count: users.filter((user) => user.role === 'parent').length,
            },
            { label: 'Élèves', count: elevesCount },
        ],
        [directionCount, elevesCount, enseignantsCount, users],
    );

    const latestUsers = useMemo(
        () => [...users].sort(compareByCreatedDesc).slice(0, 5),
        [users],
    );

    const latestClasses = useMemo(
        () => [...classes].sort(compareByCreatedDesc).slice(0, 5),
        [classes],
    );

    const elevesParClasse =
        classes.length > 0 ? (elevesCount / classes.length).toFixed(1) : '—';

    if (loading) {
        return (
            <AppLayout>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    Chargement...
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-slate-900 dark:text-slate-100">
                Tableau de bord administrateur
            </h1>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Classes" value={String(classes.length)} />
                <StatCard label="Matières" value={String(matieresCount)} />
                <StatCard label="Élèves" value={String(elevesCount)} />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                    label="Total utilisateurs"
                    value={String(totalUsers)}
                />
                <StatCard
                    label="Enseignants"
                    value={String(enseignantsCount)}
                />
                <StatCard label="Direction" value={String(directionCount)} />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <h2 className="mb-4 text-base font-medium text-slate-900 dark:text-slate-100">
                        Répartition des utilisateurs
                    </h2>
                    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                        {distribution.map((item) => (
                            <li
                                key={item.label}
                                className="flex items-center justify-between gap-3 py-2"
                            >
                                <span className="text-sm text-slate-900 dark:text-slate-100">
                                    {item.label}
                                </span>
                                <Badge tone="info">{item.count}</Badge>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card>
                    <h2 className="mb-4 text-base font-medium text-slate-900 dark:text-slate-100">
                        Vue d'ensemble
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <StatCard
                            label="Classes"
                            value={String(classes.length)}
                            className="!p-4"
                        />
                        <StatCard
                            label="Élèves"
                            value={String(elevesCount)}
                            className="!p-4"
                        />
                        <StatCard
                            label="≈ élèves par classe"
                            value={elevesParClasse}
                            className="!p-4"
                        />
                    </div>
                </Card>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <h2 className="mb-4 text-base font-medium text-slate-900 dark:text-slate-100">
                        Derniers utilisateurs
                    </h2>
                    {latestUsers.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Aucun utilisateur.
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
                                        <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                            Rôle
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-slate-200 dark:border-slate-800"
                                        >
                                            <td className="px-3 py-2">
                                                {user.nom}
                                            </td>
                                            <td className="px-3 py-2">
                                                {user.prenom}
                                            </td>
                                            <td className="px-3 py-2">
                                                <Badge
                                                    tone={ROLE_TONES[user.role]}
                                                >
                                                    {ROLE_LABELS[user.role]}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                <Card>
                    <h2 className="mb-4 text-base font-medium text-slate-900 dark:text-slate-100">
                        Dernières classes
                    </h2>
                    {latestClasses.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Aucune classe.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                            Classe
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                            Niveau
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestClasses.map((classe) => (
                                        <tr
                                            key={classe.id_classe}
                                            className="border-b border-slate-200 dark:border-slate-800"
                                        >
                                            <td className="px-3 py-2">
                                                {classe.nom}
                                            </td>
                                            <td className="px-3 py-2">
                                                <Badge tone="info">
                                                    {classe.niveau}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            <Card>
                <h2 className="mb-4 text-base font-medium text-slate-900 dark:text-slate-100">
                    Actions rapides
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Button href="/dashboard/admin/classes/create">
                        + Ajouter une classe
                    </Button>
                    <Button href="/dashboard/admin/matieres/create">
                        + Ajouter une matière
                    </Button>
                    <Button href="/admin/users/create">
                        + Ajouter un enseignant
                    </Button>
                    <Button href="/dashboard/admin/eleves/create">
                        + Ajouter un élève
                    </Button>
                </div>
            </Card>
        </AppLayout>
    );
}
