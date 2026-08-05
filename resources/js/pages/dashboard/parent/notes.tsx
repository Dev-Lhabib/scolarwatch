import { Head } from '@inertiajs/react';
import ParentRecordsTable from '@/components/parent/ParentRecordsTable';
import AppLayout from '@/layouts/AppLayout';

type ParentNote = {
    id_note: number;
    valeur: string;
    trimestre: string;
    date: string;
    matiere: { id_matiere: number; nom: string } | null;
    utilisateur: { id: number; prenom: string; nom: string } | null;
};

export default function ParentNotes() {
    return (
        <AppLayout>
            <Head title="Notes" />
            <ParentRecordsTable<ParentNote>
                title="Notes"
                endpoint="/api/parent/notes"
                emptyMessage="Aucune note enregistrée pour cet enfant."
                rowKey={(note) => note.id_note}
                columns={[
                    {
                        header: 'Matière',
                        render: (note) => note.matiere?.nom ?? '—',
                    },
                    {
                        header: 'Enseignant',
                        render: (note) =>
                            note.utilisateur
                                ? `${note.utilisateur.prenom} ${note.utilisateur.nom}`
                                : '—',
                    },
                    {
                        header: 'Note',
                        render: (note) => `${Number(note.valeur)} / 20`,
                    },
                    { header: 'Trimestre', render: (note) => note.trimestre },
                    {
                        header: 'Date',
                        render: (note) => String(note.date).slice(0, 10),
                    },
                ]}
            />
        </AppLayout>
    );
}
