import { TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';
import Button from './Button';

type Props = {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmVariant?: 'primary' | 'danger';
    loading?: boolean;
    loadingLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    confirmVariant = 'primary',
    loading = false,
    loadingLabel,
    onConfirm,
    onCancel,
}: Props) {
    useEffect(() => {
        if (!open) {
            return;
        }

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onCancel();
            }
        }

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onCancel]);

    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8"
            onClick={onCancel}
        >
            <div
                className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                onClick={(event) => event.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
            >
                <div className="flex items-start gap-3">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            confirmVariant === 'danger'
                                ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                                : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                        }`}
                    >
                        <TriangleAlert className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                        <h2
                            id="confirm-dialog-title"
                            className="text-base font-medium text-slate-900 dark:text-slate-100"
                        >
                            {title}
                        </h2>
                        {description && (
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <Button
                        type="button"
                        tone="secondary"
                        size="sm"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        tone={confirmVariant}
                        size="sm"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading
                            ? (loadingLabel ?? confirmLabel)
                            : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
