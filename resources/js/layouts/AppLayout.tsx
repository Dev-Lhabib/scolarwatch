import { Head } from '@inertiajs/react';
import { ReactNode, useEffect } from 'react';
import { getAuthUser, logout } from '@/lib/auth';

const NAV_LINKS: Record<string, Array<{ label: string; href: string }>> = {
    admin: [
        { label: 'Dashboard', href: '/dashboard/admin' },
        { label: 'Utilisateurs', href: '/admin/users/create' },
        { label: 'Classes', href: '/dashboard/admin/classes' },
        { label: 'Matières', href: '/dashboard/admin/matieres' },
        { label: 'Élèves', href: '/dashboard/admin/eleves' },
    ],
    enseignant: [
        { label: 'Mes Classes', href: '#' },
        { label: 'Saisie', href: '#' },
    ],
    direction: [
        { label: 'Tableau de bord', href: '/dashboard/direction' },
        { label: 'Statistiques', href: '/dashboard/direction/statistiques' },
    ],
    parent: [
        { label: 'Mes Communications', href: '#' },
    ],
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
            <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                <nav className="flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-3 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                        ScolarWatch
                    </span>
                    <div className="flex items-center gap-6">
                        {links.length > 0 && (
                            <div className="hidden items-center gap-4 sm:flex">
                                {links.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="text-sm text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                {user.prenom} {user.nom}
                            </span>
                            <span className="rounded border border-[#e3e3e0] px-2 py-0.5 text-xs text-[#706f6c] dark:border-[#3E3E3A] dark:text-[#A1A09A]">
                                {user.role}
                            </span>
                            <button
                                type="button"
                                onClick={logout}
                                className="rounded-sm border border-black bg-[#1b1b18] px-3 py-1 text-xs font-medium text-white hover:border-black hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
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
