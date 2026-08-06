import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const baseClass =
    'w-full rounded border bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    hasError?: boolean;
};

export default function Select({
    className = '',
    hasError = false,
    ...props
}: SelectProps) {
    return (
        <select
            className={cn(
                baseClass,
                hasError
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-slate-300 dark:border-slate-700',
                className,
            )}
            {...props}
        />
    );
}
