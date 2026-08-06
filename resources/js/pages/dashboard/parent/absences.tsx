import { Head } from '@inertiajs/react';
import ParentRecordsTable from '@/components/parent/ParentRecordsTable';
import Badge from '@/components/ui/Badge';
import AppLayout from '@/layouts/AppLayout';

type ParentAbsence = {
    id_absence: number;
    date_absence: string;
    justifiee: boolean;
    motif: string | null;
    utilisateur: { id: number; prenom: string; nom: string } | null;
};

export default function ParentAbsences() {
    return (
        <AppLayout>
            <Head title="Absences" />
            <ParentRecordsTable<ParentAbsence>
                title="Absences"
                endpoint="/api/parent/absences"
                emptyMessage="Aucune absence enregistrée pour cet enfant."
                rowKey={(absence) => absence.id_absence}
                columns={[
                    {
                        header: 'Date',
                        render: (absence) =>
                            String(absence.date_absence).slice(0, 10),
                    },
                    {
                        header: 'Enseignant',
                        render: (absence) =>
                            absence.utilisateur
                                ? `${absence.utilisateur.prenom} ${absence.utilisateur.nom}`
                                : '—',
                    },
                    {
                        header: 'Justifiée',
                        render: (absence) =>
                            absence.justifiee ? (
                                <Badge tone="success">Justifiée</Badge>
                            ) : (
                                <Badge tone="danger">Non justifiée</Badge>
                            ),
                    },
                    {
                        header: 'Motif',
                        render: (absence) => absence.motif ?? '—',
                    },
                ]}
            />
        </AppLayout>
    );
}
