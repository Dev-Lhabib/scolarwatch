import { cn } from '@/lib/utils';

export function fieldClassName(hasError = false): string {
    return cn(
        'w-full rounded border bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:text-slate-100',
        hasError
            ? 'border-red-500 dark:border-red-500'
            : 'border-slate-300 dark:border-slate-700',
    );
}

export function fieldError(
    errors: Record<string, string[]>,
    field: string,
): string | undefined {
    return errors[field]?.[0];
}

export function formError(
    errors: Record<string, string[]>,
    fields: string[],
): string | undefined {
    const messages = Object.entries(errors)
        .filter(([key]) => !fields.includes(key))
        .map(([, value]) => value)
        .flat();

    return messages.length > 0 ? messages.join(', ') : undefined;
}
