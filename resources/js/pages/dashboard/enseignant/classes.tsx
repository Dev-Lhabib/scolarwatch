import { useEffect, useState } from 'react';
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

type Absence = {
    id_absence: number;
    date_absence: string;
    justifiee: boolean;
    motif: string | null;
    id_eleve: number;
};

type Retard = {
    id_retard: number;
    date_retard: string;
    minutes_retard: number;
    motif: string | null;
    id_eleve: number;
};

type Remarque = {
    id_remarque: number;
    contenu: string;
    date_remarque: string;
    trimestre: string;
    id_eleve: number;
};

type Note = {
    id_note: number;
    valeur: number;
    date: string;
    trimestre: string;
    id_eleve: number;
    id_matiere: number;
};

type Matiere = {
    id_matiere: number;
    nom: string;
};

export default function EnseignantClasses() {
    const user = getAuthUser();

    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [retards, setRetards] = useState<Retard[]>([]);
    const [remarques, setRemarques] = useState<Remarque[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [matieres, setMatieres] = useState<Matiere[]>([]);
    const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'enseignant') {
            window.location.href = '/login';

            return;
        }

        async function load() {
            const authUserId = user?.id;

            if (authUserId == null) {
                return;
            }

            try {
                const [classesRes, elevesRes, absencesRes, retardsRes, remarquesRes, notesRes, matieresRes] =
                    await Promise.all([
                        apiFetch('/api/classes'),
                        apiFetch('/api/eleves'),
                        apiFetch('/api/absences'),
                        apiFetch('/api/retards'),
                        apiFetch('/api/remarques'),
                        apiFetch('/api/notes'),
                        apiFetch('/api/matieres'),
                    ]);

                const allClasses: Classe[] = await classesRes.json();
                const allEleves: Eleve[] = await elevesRes.json();
                const absencesJson: Absence[] = await absencesRes.json();
                const retardsJson: Retard[] = await retardsRes.json();
                const remarquesJson: Remarque[] = await remarquesRes.json();
                const notesJson: Note[] = await notesRes.json();
                const matieresJson: Matiere[] = await matieresRes.json();

                const mesClasses = allClasses.filter(
                    (classe) =>
                        classe.professeur_principal?.id === authUserId ||
                        classe.enseignants?.some((enseignant) => enseignant.id === authUserId),
                );
                const idsClasses = new Set(mesClasses.map((classe) => classe.id_classe));
                const mesEleves = allEleves.filter((eleve) => idsClasses.has(eleve.id_classe));
                const idsEleves = new Set(mesEleves.map((eleve) => eleve.id_eleve));

                setClasses(mesClasses);
                setEleves(mesEleves);
                setAbsences(absencesJson.filter((absence) => idsEleves.has(absence.id_eleve)));
                setRetards(retardsJson.filter((retard) => idsEleves.has(retard.id_eleve)));
                setRemarques(remarquesJson.filter((remarque) => idsEleves.has(remarque.id_eleve)));
                setNotes(notesJson.filter((note) => idsEleves.has(note.id_eleve)));
                setMatieres(matieresJson);
            } catch {
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user]);

    const matiereMap = Object.fromEntries(matieres.map((matiere) => [matiere.id_matiere, matiere.nom]));

    function eleveAbsences(id: number): Absence[] {
        return absences.filter((absence) => absence.id_eleve === id);
    }

    function eleveRetards(id: number): Retard[] {
        return retards.filter((retard) => retard.id_eleve === id);
    }

    function eleveRemarques(id: number): Remarque[] {
        return remarques.filter((remarque) => remarque.id_eleve === id);
    }

    function eleveNotes(id: number): Note[] {
        return notes.filter((note) => note.id_eleve === id);
    }

    const classesWithEleves = classes.map((classe) => ({
        ...classe,
        eleves: eleves.filter((eleve) => eleve.id_classe === classe.id_classe),
    }));

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-slate-900 dark:text-slate-100">
                Mes Classes
            </h1>

            {loading ? (
                <div className="space-y-6">
                    {[0, 1, 2].map((item) => (
                        <div
                            key={item}
                            className="rounded-lg bg-white p-6 border border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                        >
                            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="mt-4 h-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {classesWithEleves.map((classe) => (
                        <div
                            key={classe.id_classe}
                            className="rounded-lg bg-white p-6 border border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                        >
                            <h2 className="mb-4 text-base font-medium text-slate-900 dark:text-slate-100">
                                {classe.nom} — {classe.niveau}
                            </h2>

                            {classe.eleves.length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Aucun élève dans cette classe.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">Nom</th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">Prénom</th>
                                                <th className="px-3 py-2 text-center font-medium text-slate-500 dark:text-slate-400">Absences</th>
                                                <th className="px-3 py-2 text-center font-medium text-slate-500 dark:text-slate-400">Retards</th>
                                                <th className="px-3 py-2 text-right font-medium text-slate-500 dark:text-slate-400">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classe.eleves.map((eleve) => (
                                                <tr
                                                    key={eleve.id_eleve}
                                                    className="border-b border-slate-200 dark:border-slate-800"
                                                >
                                                    <td className="px-3 py-2">{eleve.nom}</td>
                                                    <td className="px-3 py-2">{eleve.prenom}</td>
                                                    <td className="px-3 py-2 text-center">{eleveAbsences(eleve.id_eleve).length}</td>
                                                    <td className="px-3 py-2 text-center">{eleveRetards(eleve.id_eleve).length}</td>
                                                    <td className="px-3 py-2 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedEleve(eleve)}
                                                            className="rounded-sm border border-slate-400 px-3 py-1 text-xs font-medium text-slate-500 hover:border-slate-900 hover:text-slate-900 dark:border-slate-600 dark:text-slate-400 dark:hover:border-slate-100 dark:hover:text-slate-100"
                                                        >
                                                            Voir
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}

                    {classesWithEleves.length === 0 && (
                        <div className="rounded-lg bg-white p-6 text-center text-sm text-slate-500 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800">
                            Aucune classe assignée.
                        </div>
                    )}
                </div>
            )}

            {selectedEleve && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-12"
                    onClick={() => setSelectedEleve(null)}
                >
                    <div
                        className="mx-4 w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-slate-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                                {selectedEleve.prenom} {selectedEleve.nom}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setSelectedEleve(null)}
                                className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                            >
                                Fermer
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Absences ({eleveAbsences(selectedEleve.id_eleve).length})
                                </h3>
                                {eleveAbsences(selectedEleve.id_eleve).length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Aucune absence.</p>
                                ) : (
                                    <ul className="space-y-1">
                                        {eleveAbsences(selectedEleve.id_eleve).map((absence) => (
                                            <li key={absence.id_absence} className="flex items-center gap-3 text-sm text-slate-900 dark:text-slate-100">
                                                <span className="font-medium">{absence.date_absence}</span>
                                                {absence.justifiee && (
                                                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">Justifiée</span>
                                                )}
                                                {absence.motif && <span className="text-slate-500 dark:text-slate-400">— {absence.motif}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div>
                                <h3 className="mb-2 mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Retards ({eleveRetards(selectedEleve.id_eleve).length})
                                </h3>
                                {eleveRetards(selectedEleve.id_eleve).length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Aucun retard.</p>
                                ) : (
                                    <ul className="space-y-1">
                                        {eleveRetards(selectedEleve.id_eleve).map((retard) => (
                                            <li key={retard.id_retard} className="flex items-center gap-3 text-sm text-slate-900 dark:text-slate-100">
                                                <span className="font-medium">{retard.date_retard}</span>
                                                <span className="text-slate-500 dark:text-slate-400">{retard.minutes_retard} min</span>
                                                {retard.motif && <span className="text-slate-500 dark:text-slate-400">— {retard.motif}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div>
                                <h3 className="mb-2 mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Notes ({eleveNotes(selectedEleve.id_eleve).length})
                                </h3>
                                {eleveNotes(selectedEleve.id_eleve).length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Aucune note.</p>
                                ) : (
                                    <ul className="space-y-1">
                                        {eleveNotes(selectedEleve.id_eleve).map((note) => (
                                            <li key={note.id_note} className="flex items-center gap-3 text-sm text-slate-900 dark:text-slate-100">
                                                <span className="font-medium">{note.valeur}/20</span>
                                                <span className="text-slate-500 dark:text-slate-400">{matiereMap[note.id_matiere] ?? `Matière #${note.id_matiere}`}</span>
                                                <span className="text-slate-500 dark:text-slate-400">— {note.date}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div>
                                <h3 className="mb-2 mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Remarques ({eleveRemarques(selectedEleve.id_eleve).length})
                                </h3>
                                {eleveRemarques(selectedEleve.id_eleve).length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Aucune remarque.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {eleveRemarques(selectedEleve.id_eleve).map((remarque) => (
                                            <li key={remarque.id_remarque} className="text-sm text-slate-900 dark:text-slate-100">
                                                <span className="font-medium">{remarque.date_remarque}</span> ({remarque.trimestre})
                                                <br />
                                                {remarque.contenu}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
