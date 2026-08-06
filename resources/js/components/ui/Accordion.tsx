import type { ReactNode } from 'react';

type AccordionProps = {
    id: string | number;
    open: boolean;
    onToggle: () => void;
    title: ReactNode;
    subtitle?: ReactNode;
    children: ReactNode;
};

export default function Accordion({
    id,
    open,
    onToggle,
    title,
    subtitle,
    children,
}: AccordionProps) {
    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                aria-controls={`accordion-panel-${id}`}
                className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left"
            >
                <span className="flex items-center gap-3">
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 dark:text-slate-500 ${
                            open ? 'rotate-180' : ''
                        }`}
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                        />
                    </svg>

                    <span>
                        <span className="block text-base font-medium text-slate-900 dark:text-slate-100">
                            {title}
                        </span>

                        {subtitle != null && (
                            <span className="mt-1 flex flex-wrap items-center gap-2">
                                {subtitle}
                            </span>
                        )}
                    </span>
                </span>
            </button>

            <div
                id={`accordion-panel-${id}`}
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
            >
                <div className="min-h-0 overflow-hidden">
                    <div
                        className={
                            open
                                ? 'border-t border-slate-200 dark:border-slate-800'
                                : undefined
                        }
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
