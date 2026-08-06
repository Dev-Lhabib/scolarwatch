import RetardEntryForm from '@/components/enseignant/RetardEntryForm';
import type { Retard } from '@/components/enseignant/RetardEntryForm';
import SaisieWorkbench, {
    noAverageColumn,
    studentCountColumn,
} from '@/components/enseignant/SaisieWorkbench';
import type {
    Column,
    Eleve,
    ResourceConfig,
} from '@/components/enseignant/SaisieWorkbench';

const HISTORY_COLUMNS: Column<Retard>[] = [
    {
        header: 'Date',
        render: (retard) => String(retard.date_retard).slice(0, 10),
    },
    {
        header: 'Durée',
        render: (retard) => `${retard.minutes_retard} min`,
    },
    {
        header: 'Justifié',
        render: (retard) =>
            retard.justifiee ? (
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Justifié
                </span>
            ) : (
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-800 dark:bg-red-900/40 dark:text-red-300">
                    Non justifié
                </span>
            ),
    },
    { header: 'Motif', render: (retard) => retard.motif ?? '—' },
];

const STUDENT_COLUMNS = [
    studentCountColumn<Retard>(),
    noAverageColumn<Retard>(),
];

const CONFIG: ResourceConfig<Retard, object> = {
    endpoint: '/api/retards',
    addButtonLabel: '+ Ajouter un retard',
    historyTitle: 'Historique des retards',
    emptyMessage: 'Aucun retard enregistré.',
    selectPrompt: 'Sélectionnez un élève pour consulter son historique.',
    newModalTitle: 'Nouveau retard',
    editModalTitle: 'Modifier le retard',
    savedNewMessage: 'Retard enregistré.',
    savedEditMessage: 'Retard modifié avec succès.',
    deletedMessage: 'Retard supprimé.',
    confirmDelete: () => 'Supprimer ce retard ?',
    rowKey: (retard) => retard.id_retard,
    matchesContext: (retard, { authUserId }) =>
        retard.id_utilisateur === authUserId,
    historyColumns: HISTORY_COLUMNS,
    studentColumns: STUDENT_COLUMNS,
    Form: RetardEntryForm,
};

type Props = {
    eleves: Eleve[];
    authUserId: number;
    selectedEleveId: number | null;
    onSelectEleve: (idEleve: number) => void;
    refreshKey: number;
    onChanged: () => void;
};

export default function RetardEntry({
    eleves,
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
            selectedEleveId={selectedEleveId}
            onSelectEleve={onSelectEleve}
            refreshKey={refreshKey}
            config={CONFIG}
            formProps={{}}
            onChanged={onChanged}
        />
    );
}
