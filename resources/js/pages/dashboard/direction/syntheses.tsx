import { useEffect, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import StudentInfoCard from '@/components/enseignant/StudentInfoCard';
import StudentSelector from '@/components/enseignant/StudentSelector';
import SyntheseEntry from '@/components/enseignant/SyntheseEntry';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type Classe = {
    id_classe: number;
    nom: string;
    niveau: string;
};

type Eleve = {
    id_eleve: number;
    nom: string;
    prenom: string;
    id_classe: number;
};

const TRIMESTRES = ['T1', 'T2'] as const;

export default function DirectionSyntheses() {
    const user = getAuthUser();

    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [allEleves, setAllEleves] = useState<Eleve[]>([]);

    const [selectedClasseId, setSelectedClasseId] = useState<number | ''>('');
    const [selectedTrimestre, setSelectedTrimestre] = useState<string>('T1');
    const [selectedEleveId, setSelectedEleveId] = useState<number | ''>('');
    const [openClasseId, setOpenClasseId] = useState<number | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'direction') {
            window.location.href = '/login';

            return;
        }

        async function load() {
            try {
                const [classesRes, elevesRes] = await Promise.all([
                    apiFetch('/api/classes'),
                    apiFetch('/api/eleves'),
                ]);

                const classesJson = await classesRes.json();
                const elevesJson = await elevesRes.json();

                setClasses(Array.isArray(classesJson) ? classesJson : []);
                setAllEleves(Array.isArray(elevesJson) ? elevesJson : []);
            } catch {
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }

        void load();
    }, [user]);

    const selectedClasse =
        classes.find((classe) => classe.id_classe === selectedClasseId) ?? null;
    const elevesDansClasse = allEleves.filter(
        (eleve) => eleve.id_classe === selectedClasseId,
    );
    const selectedEleve =
        allEleves.find((eleve) => eleve.id_eleve === selectedEleveId) ?? null;

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
                    Synthèses IA
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

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-slate-900 dark:text-slate-100">
                Synthèses IA
            </h1>

            {selectedEleve && (
                <div className="mb-6">
                    <StudentInfoCard
                        eleve={selectedEleve}
                        classe={selectedClasse}
                        trimestre={selectedTrimestre}
                        mode="Synthèse IA"
                    />
                </div>
            )}

            {classes.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                    Aucune classe disponible.
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                            1. Classe
                        </h2>

                        {classes.map((classe) => {
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
                                                2. Trimestre
                                            </h3>
                                            <div className="mb-6 flex gap-3">
                                                {TRIMESTRES.map((trimestre) => (
                                                    <button
                                                        key={trimestre}
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedTrimestre(
                                                                trimestre,
                                                            )
                                                        }
                                                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                                                            selectedTrimestre ===
                                                            trimestre
                                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-900 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200'
                                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500'
                                                        }`}
                                                    >
                                                        {trimestre}
                                                    </button>
                                                ))}
                                            </div>

                                            <h3 className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                                                3. Sélectionner un élève
                                            </h3>
                                            <StudentSelector
                                                students={elevesDansClasse}
                                                selectedId={
                                                    selectedEleveId === ''
                                                        ? null
                                                        : selectedEleveId
                                                }
                                                onSelect={(eleve) =>
                                                    handleSelectEleve(
                                                        eleve.id_eleve,
                                                    )
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {selectedEleve && (
                        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                            <SyntheseEntry
                                eleve={selectedEleve}
                                trimestre={selectedTrimestre}
                            />
                        </div>
                    )}
                </div>
            )}
        </AppLayout>
    );
}
