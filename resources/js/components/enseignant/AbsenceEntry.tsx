import AbsenceEntryForm from '@/components/enseignant/AbsenceEntryForm';
import type { Absence } from '@/components/enseignant/AbsenceEntryForm';
import SaisieWorkbench, {
    noAverageColumn,
    studentCountColumn,
} from '@/components/enseignant/SaisieWorkbench';
import type {
    Column,
    Eleve,
    ResourceConfig,
} from '@/components/enseignant/SaisieWorkbench';

const HISTORY_COLUMNS: Column<Absence>[] = [
    {
        header: 'Date',
        render: (absence) => String(absence.date_absence).slice(0, 10),
    },
    {
        header: 'Justifiée',
        render: (absence) =>
            absence.justifiee ? (
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Justifiée
                </span>
            ) : (
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-800 dark:bg-red-900/40 dark:text-red-300">
                    Non justifiée
                </span>
            ),
    },
    { header: 'Motif', render: (absence) => absence.motif ?? '—' },
];

const STUDENT_COLUMNS = [
    studentCountColumn<Absence>(),
    noAverageColumn<Absence>(),
];

const CONFIG: ResourceConfig<Absence, object> = {
    endpoint: '/api/absences',
    addButtonLabel: '+ Ajouter une absence',
    historyTitle: 'Historique des absences',
    emptyMessage: 'Aucune absence enregistrée.',
    selectPrompt: 'Sélectionnez un élève pour consulter son historique.',
    newModalTitle: 'Nouvelle absence',
    editModalTitle: "Modifier l'absence",
    savedNewMessage: 'Absence enregistrée.',
    savedEditMessage: 'Absence modifiée avec succès.',
    deletedMessage: 'Absence supprimée.',
    confirmDelete: () => 'Supprimer cette absence ?',
    rowKey: (absence) => absence.id_absence,
    matchesContext: (absence, { authUserId }) =>
        absence.id_utilisateur === authUserId,
    historyColumns: HISTORY_COLUMNS,
    studentColumns: STUDENT_COLUMNS,
    Form: AbsenceEntryForm,
};

type Props = {
    eleves: Eleve[];
    authUserId: number;
    selectedEleveId: number | null;
    onSelectEleve: (idEleve: number) => void;
    refreshKey: number;
    onChanged: () => void;
};

export default function AbsenceEntry({
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
