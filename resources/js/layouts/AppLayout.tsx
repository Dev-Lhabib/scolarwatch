import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlarmClock,
    Archive,
    BarChart3,
    Bell,
    BookOpen,
    CalendarX2,
    ClipboardList,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquareQuote,
    Sparkles,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getAuthUser, logout } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

type NavLink = {
    label: string;
    href: string;
    icon: LucideIcon;
};

const ROLE_LABELS: Record<AuthUser['role'], string> = {
    admin: 'Admin',
    enseignant: 'Enseignant',
    direction: 'Direction',
    parent: 'Parent',
};

const NAV_LINKS: Record<AuthUser['role'], NavLink[]> = {
    admin: [
        { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
        { label: 'Utilisateurs', href: '/admin/users', icon: Users },
        {
            label: 'Archives',
            href: '/admin/archives',
            icon: Archive,
        },
        {
            label: 'Classes',
            href: '/dashboard/admin/classes',
            icon: GraduationCap,
        },
        {
            label: 'Matières',
            href: '/dashboard/admin/matieres',
            icon: BookOpen,
        },
        { label: 'Élèves', href: '/dashboard/admin/eleves', icon: UserCheck },
    ],
    enseignant: [
        {
            label: 'Dashboard',
            href: '/dashboard/enseignant',
            icon: LayoutDashboard,
        },
        {
            label: 'Mes Classes',
            href: '/dashboard/enseignant/classes',
            icon: GraduationCap,
        },
        {
            label: 'Saisie',
            href: '/dashboard/enseignant/saisie',
            icon: ClipboardList,
        },
        {
            label: 'Synthèses IA',
            href: '/dashboard/enseignant/syntheses',
            icon: Sparkles,
        },
    ],
    direction: [
        {
            label: 'Tableau de bord',
            href: '/dashboard/direction',
            icon: LayoutDashboard,
        },
        {
            label: 'Statistiques',
            href: '/dashboard/direction/statistiques',
            icon: BarChart3,
        },
        {
            label: 'Synthèses IA',
            href: '/dashboard/direction/syntheses',
            icon: Sparkles,
        },
    ],
    parent: [
        { label: 'Communications', href: '/dashboard/parent', icon: Bell },
        { label: 'Notes', href: '/dashboard/parent/notes', icon: BookOpen },
        {
            label: 'Absences',
            href: '/dashboard/parent/absences',
            icon: CalendarX2,
        },
        {
            label: 'Retards',
            href: '/dashboard/parent/retards',
            icon: AlarmClock,
        },
        {
            label: 'Remarques',
            href: '/dashboard/parent/remarques',
            icon: MessageSquareQuote,
        },
    ],
};

const DASHBOARD_HREFS = new Set([
    '/dashboard/admin',
    '/dashboard/enseignant',
    '/dashboard/direction',
    '/dashboard/parent',
]);

function initialsOf(prenom: string, nom: string): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export default function AppLayout({ children }: { children: ReactNode }) {
    const user = getAuthUser();
    const url = usePage().url.split('?')[0];
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!getAuthUser()) {
            window.location.href = '/login';
        }
    }, []);

    if (!user) {
        return null;
    }

    const links = NAV_LINKS[user.role] ?? [];

    function linkIsActive(href: string): boolean {
        if (DASHBOARD_HREFS.has(href)) {
            return url === href;
        }

        return url === href || url.startsWith(`${href}/`);
    }

    const activeHref = links
        .filter((link) => linkIsActive(link.href))
        .sort((a, b) => b.href.length - a.href.length)[0]?.href;

    return (
        <>
            <Head title="ScolarWatch" />
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-slate-950/50 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <aside
                    className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
                >
                    <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
                        <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            ScolarWatch
                        </span>
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="text-slate-500 hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:text-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const active = link.href === activeHref;

                            return (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                        active
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                                    }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                        <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                                {initialsOf(user.prenom, user.nom)}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {user.prenom} {user.nom}
                                </p>
                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                    {ROLE_LABELS[user.role]}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={logout}
                            className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        >
                            <LogOut className="h-4 w-4" />
                            Déconnexion
                        </button>
                    </div>
                </aside>

                <div className="flex min-h-screen flex-col">
                    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden dark:border-slate-800 dark:bg-slate-900">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            ScolarWatch
                        </span>
                        <span className="w-6" />
                    </header>
                    <main className="flex-1 p-6 md:ml-64 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
