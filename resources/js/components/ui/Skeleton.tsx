import type { HTMLAttributes } from 'react';
import Card from '@/components/ui/Card';

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export default function Skeleton({ className = '', ...props }: SkeletonProps) {
    return (
        <div
            className={`h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${className}`.trim()}
            {...props}
        />
    );
}

export function StatCardSkeleton() {
    return (
        <Card>
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="mt-2 h-6 w-1/3" />
        </Card>
    );
}
