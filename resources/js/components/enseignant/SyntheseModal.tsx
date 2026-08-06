import SyntheseEntry from '@/components/enseignant/SyntheseEntry';

type Eleve = {
    id_eleve: number;
    nom: string;
    prenom: string;
};

type Props = {
    eleve: Eleve;
    onClose: () => void;
};

export default function SyntheseModal({ eleve, onClose }: Props) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8"
            onClick={onClose}
        >
            <div
                className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-slate-900"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                        {eleve.prenom} {eleve.nom}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-500 hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-100 dark:hover:text-slate-100"
                    >
                        Fermer
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <SyntheseEntry eleve={eleve} />
                </div>
            </div>
        </div>
    );
}
