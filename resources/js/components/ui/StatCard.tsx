import type { LucideIcon } from 'lucide-react';
import Card from '@/components/ui/Card';

type StatCardProps = {
    label: string;
    value: string;
    hint?: string;
    href?: string;
    icon?: LucideIcon;
    className?: string;
};

export default function StatCard({ label, value, hint, href, icon: Icon, className = '' }: StatCardProps) {
    return (
        <Card href={href} className={className}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-1 text-2xl font-medium text-slate-900 dark:text-slate-100">
                        {value}
                    </p>
                </div>
                {Icon && (
                    <span className="shrink-0 rounded-md bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <Icon className="h-5 w-5" />
                    </span>
                )}
            </div>
            {hint && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
            )}
        </Card>
    );
}
