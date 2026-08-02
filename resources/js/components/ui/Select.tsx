import type { SelectHTMLAttributes } from 'react';

const baseClass =
    'w-full rounded border border-[#e3e3e0] bg-white px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#3E3E3A] dark:bg-slate-800 dark:text-slate-100';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className = '', ...props }: SelectProps) {
    return <select className={`${baseClass} ${className}`.trim()} {...props} />;
}
