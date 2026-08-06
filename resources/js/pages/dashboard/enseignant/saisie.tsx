import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import AbsenceEntry from '@/components/enseignant/AbsenceEntry';
import NoteEntry from '@/components/enseignant/NoteEntry';
import RemarqueEntry from '@/components/enseignant/RemarqueEntry';
import RetardEntry from '@/components/enseignant/RetardEntry';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type Classe = {
    id_classe: number;
    nom: string;
    niveau: string;
    professeur_principal?: { id: number } | null;
    enseignants?: Array<{ id: number }>;
};

type Eleve = {
    id_eleve: number;
    nom: string;
    prenom: string;
    id_classe: number;
};

type Matiere = {
    id_matiere: number;
    nom: string;
};

type SaisieType = 'notes' | 'absences' | 'retards' | 'remarques';

const TRIMESTRES = ['T1', 'T2'] as const;

const TABS: { key: SaisieType; label: string }[] = [
    { key: 'notes', label: 'Notes' },
    { key: 'absences', label: 'Absences' },
    { key: 'retards', label: 'Retards' },
    { key: 'remarques', label: 'Remarques' },
];

export default function EnseignantSaisie() {
    const user = getAuthUser();

    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [allEleves, setAllEleves] = useState<Eleve[]>([]);
    const [matieres, setMatieres] = useState<Matiere[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const [activeTab, setActiveTab] = useState<SaisieType>('notes');
    const [selectedClasseId, setSelectedClasseId] = useState<number | ''>('');
    const [selectedTrimestre, setSelectedTrimestre] = useState<string>('T1');
    const [selectedEleveId, setSelectedEleveId] = useState<number | ''>('');
    const [openClasseId, setOpenClasseId] = useState<number | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'enseignant') {
            window.location.href = '/login';

            return;
        }

        async function load() {
            try {
                const authUserId = user?.id;

                if (authUserId == null) {
                    return;
                }

                const [classesRes, elevesRes, matieresRes] = await Promise.all([
                    apiFetch('/api/classes'),
                    apiFetch('/api/eleves'),
                    apiFetch('/api/matieres'),
                ]);

                const allClasses: Classe[] = await classesRes.json();
                const allElevesData: Eleve[] = await elevesRes.json();
                const matieresData: Matiere[] = await matieresRes.json();

                setClasses(allClasses);
                setAllEleves(allElevesData);
                setMatieres(matieresData);
            } catch {
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }

        void load();
    }, [user]);

    const authUserId = user?.id ?? 0;
    const mesClasses = classes.filter(
        (classe) =>
            classe.professeur_principal?.id === authUserId ||
            classe.enseignants?.some(
                (enseignant) => enseignant.id === authUserId,
            ),
    );
    const elevesDansClasse = allEleves.filter(
        (eleve) => eleve.id_classe === selectedClasseId,
    );
    const maMatiere =
        matieres.find((matiere) => matiere.id_matiere === user?.id_matiere) ??
        null;

    function handleChange() {
        setRefreshKey((key) => key + 1);
    }

    function toggleClasse(idClasse: number) {
        if (openClasseId === idClasse) {
            setOpenClasseId(null);

            return;
        }

        setOpenClasseId(idClasse);
        setSelectedClasseId(idClasse);
        setSelectedTrimestre('T1');
        setSelectedEleveId('');
    }

    function handleSelectEleve(idEleve: number) {
        setSelectedEleveId(idEleve);
    }

    if (loading) {
        return (
            <AppLayout>
                <h1 className="mb-6 text-xl font-medium text-slate-900 dark:text-slate-100">
                    Saisie
                </h1>
                <div className="space-y-6">
                    <div className="h-10 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    {[0, 1, 2].map((item) => (
                        <div
                            key={item}
                            className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="h-4 w-1/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="mt-4 h-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                        </div>
                    ))}
                </div>
            </AppLayout>
        );
    }

    const selectedEleveIdValue =
        selectedEleveId === '' ? null : selectedEleveId;

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-slate-900 dark:text-slate-100">
                Saisie
            </h1>

            <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === tab.key
                                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {mesClasses.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                    Aucune classe assignée.
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                            Classes
                        </h2>

                        {mesClasses.map((classe) => {
                            const isOpen = openClasseId === classe.id_classe;
                            const isSelected =
                                selectedClasseId === classe.id_classe;

                            return (
                                <div
                                    key={classe.id_classe}
                                    className="border-t border-slate-200 dark:border-slate-800"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleClasse(classe.id_classe)
                                        }
                                        aria-expanded={isOpen}
                                        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                                            isOpen
                                                ? 'bg-slate-50 dark:bg-slate-800/50'
                                                : ''
                                        }`}
                                    >
                                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                                {classe.nom}
                                            </span>
                                            <span className="text-slate-500 dark:text-slate-400">
                                                {classe.niveau}
                                            </span>
                                            {classe.professeur_principal?.id ===
                                                authUserId && (
                                                <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                                    Principal
                                                </span>
                                            )}
                                            {isSelected && (
                                                <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                                            )}
                                        </span>
                                        <ChevronDown
                                            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                                                isOpen ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>

                                    {isOpen && (
                                        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                                            <h3 className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                                                Trimestre
                                            </h3>
                                            <div className="mb-6 flex gap-3">
                                                {TRIMESTRES.map((t) => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedTrimestre(
                                                                t,
                                                            )
                                                        }
                                                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                                                            selectedTrimestre ===
                                                            t
                                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-900 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200'
                                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500'
                                                        }`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>

                                            <h3 className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                                                Élèves
                                            </h3>

                                            {activeTab === 'notes' && (
                                                <NoteEntry
                                                    eleves={elevesDansClasse}
                                                    trimestre={
                                                        selectedTrimestre
                                                    }
                                                    matiere={maMatiere}
                                                    authUserId={authUserId}
                                                    selectedEleveId={
                                                        selectedEleveIdValue
                                                    }
                                                    onSelectEleve={
                                                        handleSelectEleve
                                                    }
                                                    refreshKey={refreshKey}
                                                    onChanged={handleChange}
                                                />
                                            )}

                                            {activeTab === 'absences' && (
                                                <AbsenceEntry
                                                    eleves={elevesDansClasse}
                                                    authUserId={authUserId}
                                                    selectedEleveId={
                                                        selectedEleveIdValue
                                                    }
                                                    onSelectEleve={
                                                        handleSelectEleve
                                                    }
                                                    refreshKey={refreshKey}
                                                    onChanged={handleChange}
                                                />
                                            )}

                                            {activeTab === 'retards' && (
                                                <RetardEntry
                                                    eleves={elevesDansClasse}
                                                    authUserId={authUserId}
                                                    selectedEleveId={
                                                        selectedEleveIdValue
                                                    }
                                                    onSelectEleve={
                                                        handleSelectEleve
                                                    }
                                                    refreshKey={refreshKey}
                                                    onChanged={handleChange}
                                                />
                                            )}

                                            {activeTab === 'remarques' && (
                                                <RemarqueEntry
                                                    eleves={elevesDansClasse}
                                                    trimestre={
                                                        selectedTrimestre
                                                    }
                                                    authUserId={authUserId}
                                                    selectedEleveId={
                                                        selectedEleveIdValue
                                                    }
                                                    onSelectEleve={
                                                        handleSelectEleve
                                                    }
                                                    refreshKey={refreshKey}
                                                    onChanged={handleChange}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
