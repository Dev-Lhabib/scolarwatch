import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CheckboxProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'className'
> & {
    className?: string;
};

export default function Checkbox({ className = '', ...props }: CheckboxProps) {
    return (
        <input
            type="checkbox"
            className={cn(
                'h-4 w-4 rounded border-slate-300 bg-white accent-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800',
                className,
            )}
            {...props}
        />
    );
}
