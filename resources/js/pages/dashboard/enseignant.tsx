import { FormEvent, useEffect, useState } from 'react';
import { apiFetch, getAuthUser } from '@/lib/auth';
import AppLayout from '@/layouts/AppLayout';

type Classe = {
    id_classe: number;
    nom: string;
    niveau: string;
    professeurPrincipal?: { id: number; prenom: string; nom: string } | null;
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

export default function EnseignantDashboard() {
    const user = getAuthUser();
    const [classes, setClasses] = useState<Classe[]>([]);
    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [retards, setRetards] = useState<Retard[]>([]);
    const [remarques, setRemarques] = useState<Remarque[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [matieres, setMatieres] = useState<Matiere[]>([]);
    const [syntheseLoading, setSyntheseLoading] = useState<Record<number, boolean>>({});
    const [syntheseMsg, setSyntheseMsg] = useState<string | null>(null);
    const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);

    const [selEleve, setSelEleve] = useState('');
    const [contenu, setContenu] = useState('');
    const [trimestre, setTrimestre] = useState('T1');
    const [dateRemarque, setDateRemarque] = useState(new Date().toISOString().slice(0, 10));
    const [remarqueError, setRemarqueError] = useState<string | null>(null);
    const [remarqueSuccess, setRemarqueSuccess] = useState<string | null>(null);
    const [remarqueProcessing, setRemarqueProcessing] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'enseignant') {
            window.location.href = '/login';
            return;
        }

        async function load() {
            try {
                const [classesRes, elevesRes, absencesRes, retardsRes, remarquesRes, notesRes, matieresRes] = await Promise.all([
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

                const mesClasses = allClasses.filter(
                    (c) => c.professeurPrincipal?.id === user.id,
                );
                const idsClasses = new Set(mesClasses.map((c) => c.id_classe));
                const mesEleves = allEleves.filter((e) => idsClasses.has(e.id_classe));
                const idsEleves = new Set(mesEleves.map((e) => e.id_eleve));

                setClasses(mesClasses);
                setEleves(mesEleves);
                setAbsences((await absencesRes.json() as Absence[]).filter((a) => idsEleves.has(a.id_eleve)));
                setRetards((await retardsRes.json() as Retard[]).filter((r) => idsEleves.has(r.id_eleve)));
                setRemarques((await remarquesRes.json() as Remarque[]).filter((r) => idsEleves.has(r.id_eleve)));
                setNotes((await notesRes.json() as Note[]).filter((n) => idsEleves.has(n.id_eleve)));
                setMatieres(await matieresRes.json() as Matiere[]);
            } catch {
                window.location.href = '/login';
            }
        }

        load();
    }, []);

    const matiereMap = Object.fromEntries(
        matieres.map((m) => [m.id_matiere, m.nom]),
    );

    function eleveAbsences(id: number): Absence[] {
        return absences.filter((a) => a.id_eleve === id);
    }

    function eleveRetards(id: number): Retard[] {
        return retards.filter((r) => r.id_eleve === id);
    }

    function eleveRemarques(id: number): Remarque[] {
        return remarques.filter((r) => r.id_eleve === id);
    }

    function eleveNotes(id: number): Note[] {
        return notes.filter((n) => n.id_eleve === id);
    }

    async function declencherSynthese(idEleve: number) {
        setSyntheseLoading((prev) => ({ ...prev, [idEleve]: true }));
        setSyntheseMsg(null);
        try {
            await apiFetch(`/api/eleves/${idEleve}/synthese`, {
                method: 'POST',
                body: JSON.stringify({ trimestre: 'T1' }),
            });
            setSyntheseMsg('Synthèse déclenchée avec succès.');
        } catch {
            setSyntheseMsg('Erreur lors du déclenchement de la synthèse.');
        } finally {
            setSyntheseLoading((prev) => ({ ...prev, [idEleve]: false }));
        }
    }

    async function handleRemarque(e: FormEvent) {
        e.preventDefault();
        setRemarqueError(null);
        setRemarqueSuccess(null);

        if (!selEleve) {
            setRemarqueError('Veuillez sélectionner un élève.');
            return;
        }

        setRemarqueProcessing(true);

        try {
            const response = await apiFetch('/api/remarques', {
                method: 'POST',
                body: JSON.stringify({
                    id_eleve: parseInt(selEleve, 10),
                    contenu,
                    trimestre,
                    date_remarque: dateRemarque,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                setRemarqueError(data.message || "Erreur lors de l'envoi.");
                setRemarqueProcessing(false);
                return;
            }

            setRemarqueSuccess('Remarque ajoutée avec succès.');
            setSelEleve('');
            setContenu('');
            setTrimestre('T1');
            setDateRemarque(new Date().toISOString().slice(0, 10));
            setRemarqueProcessing(false);
        } catch {
            setRemarqueError('Une erreur est survenue.');
            setRemarqueProcessing(false);
        }
    }

    const classesWithEleves = classes.map((c) => ({
        ...c,
        eleves: eleves.filter((e) => e.id_classe === c.id_classe),
    }));

    return (
        <AppLayout>
            <h1 className="mb-6 text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                Mes Classes
            </h1>

            {syntheseMsg && (
                <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
                    {syntheseMsg}
                </div>
            )}

            <div className="mb-8 space-y-6">
                {classesWithEleves.map((classe) => (
                    <div
                        key={classe.id_classe}
                        className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]"
                    >
                        <h2 className="mb-4 text-base font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                            {classe.nom} — {classe.niveau}
                        </h2>

                        {classe.eleves.length === 0 ? (
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                Aucun élève dans cette classe.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                    <thead>
                                        <tr className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                            <th className="px-3 py-2 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Nom</th>
                                            <th className="px-3 py-2 text-left font-medium text-[#706f6c] dark:text-[#A1A09A]">Prénom</th>
                                            <th className="px-3 py-2 text-center font-medium text-[#706f6c] dark:text-[#A1A09A]">Absences</th>
                                            <th className="px-3 py-2 text-center font-medium text-[#706f6c] dark:text-[#A1A09A]">Retards</th>
                                            <th className="px-3 py-2 text-right font-medium text-[#706f6c] dark:text-[#A1A09A]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classe.eleves.map((eleve) => (
                                            <tr key={eleve.id_eleve} className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                                <td className="px-3 py-2">{eleve.nom}</td>
                                                <td className="px-3 py-2">{eleve.prenom}</td>
                                                <td className="px-3 py-2 text-center">{eleveAbsences(eleve.id_eleve).length}</td>
                                                <td className="px-3 py-2 text-center">{eleveRetards(eleve.id_eleve).length}</td>
                                                <td className="px-3 py-2 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedEleve(eleve)}
                                                            className="rounded-sm border border-[#706f6c] px-3 py-1 text-xs font-medium text-[#706f6c] hover:border-[#1b1b18] hover:text-[#1b1b18] dark:border-[#A1A09A] dark:text-[#A1A09A] dark:hover:border-[#EDEDEC] dark:hover:text-[#EDEDEC]"
                                                        >
                                                            Voir
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={syntheseLoading[eleve.id_eleve]}
                                                            onClick={() => declencherSynthese(eleve.id_eleve)}
                                                            className="rounded-sm border border-black bg-[#1b1b18] px-3 py-1 text-xs font-medium text-white hover:border-black hover:bg-black disabled:opacity-50 dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                                                        >
                                                            {syntheseLoading[eleve.id_eleve]
                                                                ? 'En cours...'
                                                                : 'Synthèse'}
                                                        </button>
                                                    </div>
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
                    <div className="rounded-lg bg-white p-6 text-center text-sm text-[#706f6c] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:text-[#A1A09A] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                        Aucune classe assignée.
                    </div>
                )}
            </div>

            <section id="saisie">
                <div className="rounded-lg bg-white p-6 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                    <h2 className="mb-4 text-base font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                        Ajouter une remarque
                    </h2>

                    {remarqueError && (
                        <div className="mb-4 rounded border border-[#f53003]/30 bg-[#f53003]/10 px-3 py-2 text-sm text-[#f53003] dark:text-[#FF4433]">
                            {remarqueError}
                        </div>
                    )}

                    {remarqueSuccess && (
                        <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
                            {remarqueSuccess}
                        </div>
                    )}

                    <form onSubmit={handleRemarque} className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="selEleve" className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                Élève
                            </label>
                            <select
                                id="selEleve"
                                value={selEleve}
                                onChange={(e) => setSelEleve(e.target.value)}
                                required
                                className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                            >
                                <option value="">Sélectionnez un élève</option>
                                {eleves.map((e) => (
                                    <option key={e.id_eleve} value={e.id_eleve}>
                                        {e.prenom} {e.nom}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="contenu" className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                Contenu
                            </label>
                            <textarea
                                id="contenu"
                                value={contenu}
                                onChange={(e) => setContenu(e.target.value)}
                                required
                                rows={3}
                                className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="trimestre" className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                    Trimestre
                                </label>
                                <select
                                    id="trimestre"
                                    value={trimestre}
                                    onChange={(e) => setTrimestre(e.target.value)}
                                    required
                                    className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                                >
                                    <option value="T1">T1</option>
                                    <option value="T2">T2</option>
                                    <option value="T3">T3</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="date_remarque" className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                    Date
                                </label>
                                <input
                                    id="date_remarque"
                                    type="date"
                                    value={dateRemarque}
                                    onChange={(e) => setDateRemarque(e.target.value)}
                                    required
                                    className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={remarqueProcessing}
                            className="mt-2 rounded-sm border border-black bg-[#1b1b18] px-5 py-2 text-sm font-medium text-white hover:border-black hover:bg-black disabled:opacity-50 dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                        >
                            {remarqueProcessing ? 'Envoi...' : 'Ajouter la remarque'}
                        </button>
                    </form>
                </div>
            </section>

            {selectedEleve && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-12"
                    onClick={() => setSelectedEleve(null)}
                >
                    <div
                        className="mx-4 w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-[#161615]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                {selectedEleve.prenom} {selectedEleve.nom}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setSelectedEleve(null)}
                                className="text-sm text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                            >
                                Fermer
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="mb-2 text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Absences ({eleveAbsences(selectedEleve.id_eleve).length})
                                </h3>
                                {eleveAbsences(selectedEleve.id_eleve).length === 0 ? (
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Aucune absence.</p>
                                ) : (
                                    <ul className="space-y-1">
                                        {eleveAbsences(selectedEleve.id_eleve).map((a) => (
                                            <li key={a.id_absence} className="flex items-center gap-3 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                                <span className="font-medium">{a.date_absence}</span>
                                                {a.justifiee && <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-xs text-green-700 dark:text-green-400">Justifiée</span>}
                                                {a.motif && <span className="text-[#706f6c] dark:text-[#A1A09A]">— {a.motif}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div>
                                <h3 className="mb-2 mt-4 text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Retards ({eleveRetards(selectedEleve.id_eleve).length})
                                </h3>
                                {eleveRetards(selectedEleve.id_eleve).length === 0 ? (
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Aucun retard.</p>
                                ) : (
                                    <ul className="space-y-1">
                                        {eleveRetards(selectedEleve.id_eleve).map((r) => (
                                            <li key={r.id_retard} className="flex items-center gap-3 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                                <span className="font-medium">{r.date_retard}</span>
                                                <span className="text-[#706f6c] dark:text-[#A1A09A]">{r.minutes_retard} min</span>
                                                {r.motif && <span className="text-[#706f6c] dark:text-[#A1A09A]">— {r.motif}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div>
                                <h3 className="mb-2 mt-4 text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Notes ({eleveNotes(selectedEleve.id_eleve).length})
                                </h3>
                                {eleveNotes(selectedEleve.id_eleve).length === 0 ? (
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Aucune note.</p>
                                ) : (
                                    <ul className="space-y-1">
                                        {eleveNotes(selectedEleve.id_eleve).map((n) => (
                                            <li key={n.id_note} className="flex items-center gap-3 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                                <span className="font-medium">{n.valeur}/20</span>
                                                <span className="text-[#706f6c] dark:text-[#A1A09A">{matiereMap[n.id_matiere] ?? "Matière #" + n.id_matiere}</span>
                                                <span className="text-[#706f6c] dark:text-[#A1A09A]">— {n.date}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div>
                                <h3 className="mb-2 mt-4 text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Remarques ({eleveRemarques(selectedEleve.id_eleve).length})
                                </h3>
                                {eleveRemarques(selectedEleve.id_eleve).length === 0 ? (
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Aucune remarque.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {eleveRemarques(selectedEleve.id_eleve).map((r) => (
                                            <li key={r.id_remarque} className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                                <span className="font-medium">{r.date_remarque}</span> ({r.trimestre})<br />
                                                {r.contenu}
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
