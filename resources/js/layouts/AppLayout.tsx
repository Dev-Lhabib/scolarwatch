import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { getAuthUser, logout } from '@/lib/auth';

const NAV_LINKS: Record<string, Array<{ label: string; href: string }>> = {
    admin: [
        { label: 'Dashboard', href: '/dashboard/admin' },
        { label: 'Utilisateurs', href: '/admin/users' },
        { label: 'Classes', href: '/dashboard/admin/classes' },
        { label: 'Matières', href: '/dashboard/admin/matieres' },
        { label: 'Élèves', href: '/dashboard/admin/eleves' },
    ],
    enseignant: [
        { label: 'Dashboard', href: '/dashboard/enseignant' },
        { label: 'Mes Classes', href: '/dashboard/enseignant/classes' },
        { label: 'Saisie', href: '/dashboard/enseignant/saisie' },
        { label: 'Synthèses IA', href: '/dashboard/enseignant/syntheses' },
    ],
    direction: [
        { label: 'Tableau de bord', href: '/dashboard/direction' },
        { label: 'Statistiques', href: '/dashboard/direction/statistiques' },
    ],
    parent: [{ label: 'Mes Communications', href: '/dashboard/parent' }],
};

export default function AppLayout({ children }: { children: ReactNode }) {
    const user = getAuthUser();

    useEffect(() => {
        if (!getAuthUser()) {
            window.location.href = '/login';
        }
    }, []);

    if (!user) {
        return null;
    }

    const links = NAV_LINKS[user.role] ?? [];

    return (
        <>
            <Head title="ScolarWatch" />
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        ScolarWatch
                    </span>
                    <div className="flex items-center gap-6">
                        {links.length > 0 && (
                            <div className="hidden items-center gap-4 sm:flex">
                                {links.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-900 dark:text-slate-100">
                                {user.prenom} {user.nom}
                            </span>
                            <span className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                {user.role}
                            </span>
                            <button
                                type="button"
                                onClick={logout}
                                className="rounded-sm border border-indigo-600 bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:border-indigo-700 hover:bg-indigo-700 dark:border-indigo-500 dark:bg-indigo-500 dark:text-white dark:hover:border-indigo-400 dark:hover:bg-indigo-400"
                            >
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </nav>
                <main className="p-6">{children}</main>
            </div>
        </>
    );
}
