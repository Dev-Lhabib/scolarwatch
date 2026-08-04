import type { ReactNode } from 'react';

const TONES = {
    default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    info: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

type BadgeProps = {
    children: ReactNode;
    tone?: keyof typeof TONES;
    className?: string;
};

export default function Badge({ children, tone = 'default', className = '' }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`.trim()}
        >
            {children}
        </span>
    );
}
