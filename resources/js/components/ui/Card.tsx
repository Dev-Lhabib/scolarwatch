import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

const baseClass =
    'rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900';

type CardProps = {
    children: ReactNode;
    className?: string;
    href?: string;
};

export default function Card({ children, className = '', href }: CardProps) {
    const classes = `${baseClass} ${href ? 'transition hover:border-indigo-400 dark:hover:border-indigo-500' : ''} ${className}`.trim();

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return <div className={classes}>{children}</div>;
}
