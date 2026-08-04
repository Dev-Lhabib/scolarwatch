import { Link } from '@inertiajs/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

const TONES = {
    primary:
        'border border-indigo-600 bg-indigo-600 text-white hover:border-indigo-700 hover:bg-indigo-700 dark:border-indigo-500 dark:bg-indigo-500 dark:text-white dark:hover:border-indigo-400 dark:hover:bg-indigo-400',
    secondary:
        'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
    danger:
        'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900',
};

const SIZES = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
};

type ButtonProps = {
    tone?: keyof typeof TONES;
    size?: keyof typeof SIZES;
    href?: string;
    className?: string;
    children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>;

export default function Button({
    tone = 'primary',
    size = 'md',
    href,
    className = '',
    children,
    type = 'button',
    ...props
}: ButtonProps) {
    const classes =
        `inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${TONES[tone]} ${SIZES[size]} ${className}`.trim();

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} className={classes} {...props}>
            {children}
        </button>
    );
}
