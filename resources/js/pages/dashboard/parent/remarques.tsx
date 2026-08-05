import { Head } from '@inertiajs/react';
import ParentRecordsTable from '@/components/parent/ParentRecordsTable';
import Badge from '@/components/ui/Badge';
import AppLayout from '@/layouts/AppLayout';

type ParentRemarque = {
    id_remarque: number;
    date_remarque: string;
    categorie: string;
    contenu: string;
    utilisateur: { id: number; prenom: string; nom: string } | null;
};

const CATEGORIE_LABELS: Record<string, string> = {
    comportement: 'Comportement',
    participation: 'Participation',
    assiduite: 'Assiduité',
};

const CATEGORIE_TONES: Record<string, 'default' | 'info' | 'warning'> = {
    comportement: 'warning',
    participation: 'info',
    assiduite: 'default',
};

export default function ParentRemarques() {
    return (
        <AppLayout>
            <Head title="Remarques" />
            <ParentRecordsTable<ParentRemarque>
                title="Remarques"
                endpoint="/api/parent/remarques"
                emptyMessage="Aucune remarque enregistrée pour cet enfant."
                rowKey={(remarque) => remarque.id_remarque}
                columns={[
                    {
                        header: 'Date',
                        render: (remarque) =>
                            String(remarque.date_remarque).slice(0, 10),
                    },
                    {
                        header: 'Enseignant',
                        render: (remarque) =>
                            remarque.utilisateur
                                ? `${remarque.utilisateur.prenom} ${remarque.utilisateur.nom}`
                                : '—',
                    },
                    {
                        header: 'Catégorie',
                        render: (remarque) => (
                            <Badge tone={CATEGORIE_TONES[remarque.categorie]}>
                                {CATEGORIE_LABELS[remarque.categorie] ??
                                    remarque.categorie}
                            </Badge>
                        ),
                    },
                    {
                        header: 'Contenu',
                        render: (remarque) => remarque.contenu,
                    },
                ]}
            />
        </AppLayout>
    );
}
