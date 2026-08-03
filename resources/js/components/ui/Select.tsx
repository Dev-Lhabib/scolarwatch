import type { SelectHTMLAttributes } from 'react';

const baseClass =
    'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className = '', ...props }: SelectProps) {
    return <select className={`${baseClass} ${className}`.trim()} {...props} />;
}
