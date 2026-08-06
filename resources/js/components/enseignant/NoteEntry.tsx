import NoteEntryForm from '@/components/enseignant/NoteEntryForm';
import type { Note } from '@/components/enseignant/NoteEntryForm';
import SaisieWorkbench, {
    studentAverageColumn,
    studentCountColumn,
} from '@/components/enseignant/SaisieWorkbench';
import type {
    Column,
    Eleve,
    ResourceConfig,
} from '@/components/enseignant/SaisieWorkbench';

type FormExtras = {
    trimestre: string;
    matiere: { id_matiere: number; nom: string };
};

type Matiere = { id_matiere: number; nom: string };

const MAX_NOTES = 4;

const HISTORY_COLUMNS: Column<Note>[] = [
    { header: 'Date', render: (note) => String(note.date).slice(0, 10) },
    {
        header: 'Note',
        render: (note) => `${Number(note.valeur)} / 20`,
    },
];

const STUDENT_COLUMNS = [
    studentCountColumn<Note>(MAX_NOTES),
    studentAverageColumn<Note>(
        (notes) => {
            if (notes.length === 0) {
                return null;
            }

            const total = notes.reduce(
                (sum, note) => sum + Number(note.valeur),
                0,
            );

            return total / notes.length;
        },
        (value) => `${value.toFixed(2).replace('.', ',')} / 20`,
    ),
];

const CONFIG: ResourceConfig<Note, FormExtras> = {
    endpoint: '/api/notes',
    addButtonLabel: '+ Ajouter une évaluation',
    historyTitle: 'Historique des évaluations',
    emptyMessage: 'Aucune évaluation enregistrée.',
    selectPrompt: 'Sélectionnez un élève pour consulter son historique.',
    newModalTitle: 'Nouvelle note',
    editModalTitle: 'Modifier la note',
    savedNewMessage: 'Note enregistrée.',
    savedEditMessage: 'Note modifiée avec succès.',
    deletedMessage: 'Note supprimée.',
    confirmDelete: () => 'Supprimer cette note ?',
    rowKey: (note) => note.id_note,
    matchesContext: (note, { authUserId, matiereId, trimestre }) =>
        note.id_utilisateur === authUserId &&
        note.id_matiere === matiereId &&
        note.trimestre === trimestre,
    historyColumns: HISTORY_COLUMNS,
    studentColumns: STUDENT_COLUMNS,
    Form: NoteEntryForm,
    maxCount: MAX_NOTES,
};

type Props = {
    eleves: Eleve[];
    trimestre: string;
    matiere: Matiere | null;
    authUserId: number;
    selectedEleveId: number | null;
    onSelectEleve: (idEleve: number) => void;
    refreshKey: number;
    onChanged: () => void;
};

export default function NoteEntry({
    eleves,
    trimestre,
    matiere,
    authUserId,
    selectedEleveId,
    onSelectEleve,
    refreshKey,
    onChanged,
}: Props) {
    if (matiere == null) {
        return (
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Aucune matière n'est assignée à votre compte. Vous ne pouvez pas
                saisir de notes.
            </p>
        );
    }

    return (
        <SaisieWorkbench
            eleves={eleves}
            authUserId={authUserId}
            matiereId={matiere.id_matiere}
            trimestre={trimestre}
            selectedEleveId={selectedEleveId}
            onSelectEleve={onSelectEleve}
            refreshKey={refreshKey}
            config={CONFIG}
            formProps={{ trimestre, matiere }}
            onChanged={onChanged}
        />
    );
}
