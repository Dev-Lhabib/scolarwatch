import { Head } from '@inertiajs/react';
import ParentRecordsTable from '@/components/parent/ParentRecordsTable';
import Badge from '@/components/ui/Badge';
import AppLayout from '@/layouts/AppLayout';

type ParentRetard = {
    id_retard: number;
    date_retard: string;
    minutes_retard: number;
    justifiee: boolean;
    motif: string | null;
    utilisateur: { id: number; prenom: string; nom: string } | null;
};

export default function ParentRetards() {
    return (
        <AppLayout>
            <Head title="Retards" />
            <ParentRecordsTable<ParentRetard>
                title="Retards"
                endpoint="/api/parent/retards"
                emptyMessage="Aucun retard enregistré pour cet enfant."
                rowKey={(retard) => retard.id_retard}
                columns={[
                    {
                        header: 'Date',
                        render: (retard) =>
                            String(retard.date_retard).slice(0, 10),
                    },
                    {
                        header: 'Enseignant',
                        render: (retard) =>
                            retard.utilisateur
                                ? `${retard.utilisateur.prenom} ${retard.utilisateur.nom}`
                                : '—',
                    },
                    {
                        header: 'Minutes',
                        render: (retard) => `${retard.minutes_retard} min`,
                    },
                    {
                        header: 'Justifié',
                        render: (retard) =>
                            retard.justifiee ? (
                                <Badge tone="success">Justifié</Badge>
                            ) : (
                                <Badge tone="danger">Non justifié</Badge>
                            ),
                    },
                    {
                        header: 'Motif',
                        render: (retard) => retard.motif ?? '—',
                    },
                ]}
            />
        </AppLayout>
    );
}
