import { useEffect, useState } from 'react';
import Accordion from '@/components/ui/Accordion';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
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
    categorie: string;
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

function formatDate(value: string): string {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match === null) {
        return value;
    }

    return `${match[3]}/${match[2]}/${match[1]}`;
}

function categorieLabel(categorie: string): string {
    if (!categorie) {
        return '—';
    }

    return categorie.charAt(0).toUpperCase() + categorie.slice(1);
}

const CATEGORIE_TONES: Record<
    string,
    'default' | 'info' | 'success' | 'warning' | 'danger'
> = {
    participation: 'success',
    comportement: 'warning',
    assiduite: 'info',
};

function categorieTone(
    categorie: string,
): 'default' | 'info' | 'success' | 'warning' | 'danger' {
    return CATEGORIE_TONES[categorie] ?? 'default';
}

export default function EnseignantClasses() {
    const user = getAuthUser();
    const userId = user?.id ?? null;
    const isEnseignant = user?.role === 'enseignant';

    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [retards, setRetards] = useState<Retard[]>([]);
    const [remarques, setRemarques] = useState<Remarque[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [matieres, setMatieres] = useState<Matiere[]>([]);
    const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);
    const [openClasseId, setOpenClasseId] = useState<number | null>(null);

    useEffect(() => {
        if (!isEnseignant) {
            window.location.href = '/login';

            return;
        }

        if (userId == null) {
            return;
        }

        async function load() {
            const authUserId = userId;

            try {
                const [
                    classesRes,
                    elevesRes,
                    absencesRes,
                    retardsRes,
                    remarquesRes,
                    notesRes,
                    matieresRes,
                ] = await Promise.all([
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
                        classe.enseignants?.some(
                            (enseignant) => enseignant.id === authUserId,
                        ),
                );
                const idsClasses = new Set(
                    mesClasses.map((classe) => classe.id_classe),
                );
                const mesEleves = allEleves.filter((eleve) =>
                    idsClasses.has(eleve.id_classe),
                );
                const idsEleves = new Set(
                    mesEleves.map((eleve) => eleve.id_eleve),
                );

                setClasses(mesClasses);
                setOpenClasseId(mesClasses[0]?.id_classe ?? null);
                setEleves(mesEleves);
                setAbsences(
                    absencesJson.filter((absence) =>
                        idsEleves.has(absence.id_eleve),
                    ),
                );
                setRetards(
                    retardsJson.filter((retard) =>
                        idsEleves.has(retard.id_eleve),
                    ),
                );
                setRemarques(
                    remarquesJson.filter((remarque) =>
                        idsEleves.has(remarque.id_eleve),
                    ),
                );
                setNotes(
                    notesJson.filter((note) => idsEleves.has(note.id_eleve)),
                );
                setMatieres(matieresJson);
            } catch {
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [isEnseignant, userId]);

    const matiereMap = Object.fromEntries(
        matieres.map((matiere) => [matiere.id_matiere, matiere.nom]),
    );

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

    const classeNom = selectedEleve
        ? classesWithEleves.find(
              (classe) => classe.id_classe === selectedEleve.id_classe,
          )?.nom
        : undefined;

    function eleveCountLabel(count: number): string {
        return `${count} élève${count > 1 ? 's' : ''}`;
    }

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
                            className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="mt-4 h-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {classesWithEleves.map((classe) => (
                        <Accordion
                            key={classe.id_classe}
                            id={classe.id_classe}
                            open={openClasseId === classe.id_classe}
                            onToggle={() =>
                                setOpenClasseId(
                                    openClasseId === classe.id_classe
                                        ? null
                                        : classe.id_classe,
                                )
                            }
                            title={classe.nom}
                            subtitle={
                                <>
                                    <Badge tone="info">
                                        Niveau : {classe.niveau}
                                    </Badge>
                                    {classe.professeur_principal?.id ===
                                        user?.id && (
                                        <Badge tone="success">
                                            Professeur principal
                                        </Badge>
                                    )}
                                    <Badge>
                                        {eleveCountLabel(classe.eleves.length)}
                                    </Badge>
                                </>
                            }
                        >
                            {classe.eleves.length === 0 ? (
                                <p className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                    Aucun élève dans cette classe.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                                    Nom
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                                    Prénom
                                                </th>
                                                <th className="px-3 py-2 text-center font-medium text-slate-500 dark:text-slate-400">
                                                    Absences
                                                </th>
                                                <th className="px-3 py-2 text-center font-medium text-slate-500 dark:text-slate-400">
                                                    Retards
                                                </th>
                                                <th className="px-3 py-2 text-right font-medium text-slate-500 dark:text-slate-400">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classe.eleves.map((eleve) => (
                                                <tr
                                                    key={eleve.id_eleve}
                                                    className="border-b border-slate-200 dark:border-slate-800"
                                                >
                                                    <td className="px-3 py-2">
                                                        {eleve.nom}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {eleve.prenom}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {
                                                            eleveAbsences(
                                                                eleve.id_eleve,
                                                            ).length
                                                        }
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {
                                                            eleveRetards(
                                                                eleve.id_eleve,
                                                            ).length
                                                        }
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedEleve(
                                                                    eleve,
                                                                )
                                                            }
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
                        </Accordion>
                    ))}

                    {classesWithEleves.length === 0 && (
                        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                            Aucune classe assignée.
                        </div>
                    )}
                </div>
            )}

            {selectedEleve && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 pt-12"
                    onClick={() => setSelectedEleve(null)}
                >
                    <div
                        className="mx-4 w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-slate-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                                    {selectedEleve.prenom} {selectedEleve.nom}
                                </h2>
                                {classeNom && (
                                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                                        Classe : {classeNom}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedEleve(null)}
                                className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                            >
                                Fermer
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <StatCard
                                label="Absences"
                                value={String(
                                    eleveAbsences(selectedEleve.id_eleve)
                                        .length,
                                )}
                            />
                            <StatCard
                                label="Retards"
                                value={String(
                                    eleveRetards(selectedEleve.id_eleve).length,
                                )}
                            />
                            <StatCard
                                label="Notes"
                                value={String(
                                    eleveNotes(selectedEleve.id_eleve).length,
                                )}
                            />
                            <StatCard
                                label="Remarques"
                                value={String(
                                    eleveRemarques(selectedEleve.id_eleve)
                                        .length,
                                )}
                            />
                        </div>

                        <section className="mt-8">
                            <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                Notes
                            </h3>
                            {eleveNotes(selectedEleve.id_eleve).length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Aucune note.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                                    Date
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                                    Matière
                                                </th>
                                                <th className="px-3 py-2 text-right font-medium text-slate-500 dark:text-slate-400">
                                                    Note
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eleveNotes(
                                                selectedEleve.id_eleve,
                                            ).map((note) => (
                                                <tr
                                                    key={note.id_note}
                                                    className="border-b border-slate-200 dark:border-slate-800"
                                                >
                                                    <td className="px-3 py-2">
                                                        {formatDate(note.date)}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {matiereMap[
                                                            note.id_matiere
                                                        ] ??
                                                            `Matière #${note.id_matiere}`}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        {Number(note.valeur)} /
                                                        20
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        <section className="mt-8">
                            <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                Absences
                            </h3>
                            {eleveAbsences(selectedEleve.id_eleve).length ===
                            0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Aucune absence.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                                    Date
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                                    Statut
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                                    Motif
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eleveAbsences(
                                                selectedEleve.id_eleve,
                                            ).map((absence) => (
                                                <tr
                                                    key={absence.id_absence}
                                                    className="border-b border-slate-200 dark:border-slate-800"
                                                >
                                                    <td className="px-3 py-2">
                                                        {formatDate(
                                                            absence.date_absence,
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {absence.justifiee ? (
                                                            <Badge tone="success">
                                                                Justifiée
                                                            </Badge>
                                                        ) : (
                                                            <Badge tone="danger">
                                                                Non justifiée
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                                                        {absence.motif ?? '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        <section className="mt-8">
                            <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                Retards
                            </h3>
                            {eleveRetards(selectedEleve.id_eleve).length ===
                            0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Aucun retard.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                                    Date
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                                    Minutes
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                                    Motif
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eleveRetards(
                                                selectedEleve.id_eleve,
                                            ).map((retard) => (
                                                <tr
                                                    key={retard.id_retard}
                                                    className="border-b border-slate-200 dark:border-slate-800"
                                                >
                                                    <td className="px-3 py-2">
                                                        {formatDate(
                                                            retard.date_retard,
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {retard.minutes_retard}{' '}
                                                        min
                                                    </td>
                                                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                                                        {retard.motif ?? '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        <section className="mt-8">
                            <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                Remarques
                            </h3>
                            {eleveRemarques(selectedEleve.id_eleve).length ===
                            0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Aucune remarque.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {eleveRemarques(selectedEleve.id_eleve).map(
                                        (remarque) => (
                                            <Card
                                                key={remarque.id_remarque}
                                                className="!p-4"
                                            >
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                        {formatDate(
                                                            remarque.date_remarque,
                                                        )}
                                                    </span>
                                                    <Badge>
                                                        {remarque.trimestre}
                                                    </Badge>
                                                    <Badge
                                                        tone={categorieTone(
                                                            remarque.categorie,
                                                        )}
                                                    >
                                                        {categorieLabel(
                                                            remarque.categorie,
                                                        )}
                                                    </Badge>
                                                </div>
                                                <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                                    {remarque.contenu}
                                                </p>
                                            </Card>
                                        ),
                                    )}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
