import RemarqueEntryForm from '@/components/enseignant/RemarqueEntryForm';
import type { Remarque } from '@/components/enseignant/RemarqueEntryForm';
import SaisieWorkbench, {
    noAverageColumn,
    studentCountColumn,
} from '@/components/enseignant/SaisieWorkbench';
import type {
    Column,
    Eleve,
    ResourceConfig,
} from '@/components/enseignant/SaisieWorkbench';

type FormExtras = {
    trimestre: string;
};

const HISTORY_COLUMNS: Column<Remarque>[] = [
    {
        header: 'Date',
        render: (remarque) => String(remarque.date_remarque).slice(0, 10),
    },
    { header: 'Contenu', render: (remarque) => remarque.contenu },
];

const STUDENT_COLUMNS = [
    studentCountColumn<Remarque>(),
    noAverageColumn<Remarque>(),
];

const CONFIG: ResourceConfig<Remarque, FormExtras> = {
    endpoint: '/api/remarques',
    addButtonLabel: '+ Ajouter une remarque',
    historyTitle: 'Historique des remarques',
    emptyMessage: 'Aucune remarque enregistrée.',
    selectPrompt: 'Sélectionnez un élève pour consulter son historique.',
    newModalTitle: 'Nouvelle remarque',
    editModalTitle: 'Modifier la remarque',
    savedNewMessage: 'Remarque enregistrée.',
    savedEditMessage: 'Remarque modifiée avec succès.',
    deletedMessage: 'Remarque supprimée.',
    confirmDelete: () => 'Supprimer cette remarque ?',
    rowKey: (remarque) => remarque.id_remarque,
    matchesContext: (remarque, { authUserId, trimestre }) =>
        remarque.id_utilisateur === authUserId &&
        remarque.trimestre === trimestre,
    historyColumns: HISTORY_COLUMNS,
    studentColumns: STUDENT_COLUMNS,
    Form: RemarqueEntryForm,
    sort: (a, b) =>
        String(a.date_remarque).localeCompare(String(b.date_remarque)),
};

type Props = {
    eleves: Eleve[];
    trimestre: string;
    authUserId: number;
    selectedEleveId: number | null;
    onSelectEleve: (idEleve: number) => void;
    refreshKey: number;
    onChanged: () => void;
};

export default function RemarqueEntry({
    eleves,
    trimestre,
    authUserId,
    selectedEleveId,
    onSelectEleve,
    refreshKey,
    onChanged,
}: Props) {
    return (
        <SaisieWorkbench
            eleves={eleves}
            authUserId={authUserId}
            trimestre={trimestre}
            selectedEleveId={selectedEleveId}
            onSelectEleve={onSelectEleve}
            refreshKey={refreshKey}
            config={CONFIG}
            formProps={{ trimestre }}
            onChanged={onChanged}
        />
    );
}
