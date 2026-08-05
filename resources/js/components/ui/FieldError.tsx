import { cn } from '@/lib/utils';

type FieldErrorProps = {
    message?: string;
    className?: string;
};

export default function FieldError({ message, className }: FieldErrorProps) {
    if (!message) {
        return null;
    }

    return (
        <p
            className={cn(
                'mt-1 text-sm text-red-600 dark:text-red-400',
                className,
            )}
        >
            {message}
        </p>
    );
}
