import Badge from '@/components/ui/Badge';

type Props = {
    eleve: { id_eleve: number; nom: string; prenom: string };
    classe: { nom: string; niveau: string } | null;
    trimestre: string;
    mode: string;
};

export default function StudentInfoCard({
    eleve,
    classe,
    trimestre,
    mode,
}: Props) {
    return (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900 dark:bg-indigo-950/40">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {eleve.prenom} {eleve.nom}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {classe ? `${classe.nom} — ${classe.niveau}` : '—'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="info">Trimestre {trimestre}</Badge>
                    <Badge>Mode : {mode}</Badge>
                </div>
            </div>
        </div>
    );
}
