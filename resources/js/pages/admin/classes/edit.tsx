import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type Enseignant = {
    id: number;
    prenom: string;
    nom: string;
    role: string;
};

export default function EditClasse() {
    const classeIdRef = useRef<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [nom, setNom] = useState('');
    const [niveau, setNiveau] = useState('');
    const [anneeScolaire, setAnneeScolaire] = useState('');
    const [capacite, setCapacite] = useState('');
    const [idUtilisateurPrincipal, setIdUtilisateurPrincipal] = useState('');
    const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
    const [enseignantsAffectes, setEnseignantsAffectes] = useState<
        Enseignant[]
    >([]);
    const [enseignantAajouter, setEnseignantAajouter] = useState('');
    const [assignProcessing, setAssignProcessing] = useState(false);
    const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
    const [assignError, setAssignError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const user = getAuthUser();

        if (!user || user.role !== 'admin') {
            window.location.href = '/login';

            return;
        }

        const id = Number(
            window.location.pathname.split('/').filter(Boolean).pop(),
        );

        if (!Number.isInteger(id)) {
            window.location.href = '/dashboard/admin/classes';

            return;
        }

        classeIdRef.current = id;

        apiFetch('/api/users')
            .then(async (response) => {
                if (!response.ok) {
                    return;
                }

                const data = await response.json();
                setEnseignants(
                    data.filter(
                        (item: Enseignant) => item.role === 'enseignant',
                    ),
                );
            })
            .catch(() => {});

        apiFetch(`/api/classes/${id}`)
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    setNotFound(true);

                    return;
                }

                setNom(data.nom);
                setNiveau(data.niveau);
                setAnneeScolaire(data.annee_scolaire);
                setCapacite(String(data.capacite));
                setIdUtilisateurPrincipal(
                    data.id_utilisateur_principal != null
                        ? String(data.id_utilisateur_principal)
                        : '',
                );
                setEnseignantsAffectes(data.enseignants ?? []);
            })
            .catch(() => {
                setNotFound(true);
            })
            .finally(() => setLoading(false));
    }, []);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);

        const classeId = classeIdRef.current;

        if (classeId == null) {
            return;
        }

        setProcessing(true);

        const payload: Record<string, string | number | null> = {
            nom,
            niveau,
            annee_scolaire: anneeScolaire,
            capacite: Number(capacite),
        };

        if (idUtilisateurPrincipal !== '') {
            payload.id_utilisateur_principal = Number(idUtilisateurPrincipal);
        } else {
            payload.id_utilisateur_principal = null;
        }

        try {
            const response = await apiFetch(`/api/classes/${classeId}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                const fieldErrors = data.errors
                    ? Object.values(data.errors).flat().join('\n')
                    : '';
                const message =
                    fieldErrors !== ''
                        ? fieldErrors
                        : data.message
                          ? data.message
                          : 'Erreur lors de la mise à jour.';
                setError(message);
                setProcessing(false);

                return;
            }

            window.location.href = '/dashboard/admin/classes';
        } catch {
            setError('Une erreur est survenue. Veuillez réessayer.');
            setProcessing(false);
        }
    }

    const enseignantsDisponibles = enseignants.filter(
        (enseignant) =>
            !enseignantsAffectes.some(
                (affecte) => affecte.id === enseignant.id,
            ),
    );

    async function handleAssignEnseignant() {
        const classeId = classeIdRef.current;
        const idUtilisateur = Number(enseignantAajouter);

        if (classeId == null || !Number.isInteger(idUtilisateur)) {
            return;
        }

        setAssignError(null);
        setAssignSuccess(null);
        setAssignProcessing(true);

        try {
            const response = await apiFetch(
                `/api/classes/${classeId}/enseignants`,
                {
                    method: 'POST',
                    body: JSON.stringify({ id_utilisateur: idUtilisateur }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                const message = data.message
                    ? data.message
                    : data.errors
                      ? Object.values(data.errors).flat().join(', ')
                      : "Erreur lors de l'affectation.";
                setAssignError(message);
                setAssignProcessing(false);

                return;
            }

            setEnseignantsAffectes(data.enseignants ?? []);
            setEnseignantAajouter('');
            setAssignSuccess('Enseignant affecté à la classe.');
            setAssignProcessing(false);
        } catch {
            setAssignError("Une erreur est survenue lors de l'affectation.");
            setAssignProcessing(false);
        }
    }

    if (loading) {
        return (
            <AppLayout>
                <div className="mx-auto max-w-lg rounded-lg bg-white p-8 text-sm text-slate-500 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800">
                    Chargement...
                </div>
            </AppLayout>
        );
    }

    if (notFound) {
        return (
            <AppLayout>
                <div className="mx-auto max-w-lg rounded-lg bg-white p-8 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <h1 className="mb-1 text-xl font-medium text-slate-900 dark:text-slate-100">
                        Classe introuvable
                    </h1>
                    <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                        Cette classe n'existe pas ou n'est plus disponible.
                    </p>
                    <Button
                        href="/dashboard/admin/classes"
                    >
                        Retour à la liste
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="mx-auto max-w-lg rounded-lg bg-white p-8 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <h1 className="mb-1 text-xl font-medium text-slate-900 dark:text-slate-100">
                    Modifier la classe
                </h1>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    Mettez à jour les informations de la classe {nom || ''}.
                </p>

                {error && (
                    <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 whitespace-pre-line dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label
                            htmlFor="nom"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Nom
                        </label>
                        <input
                            id="nom"
                            type="text"
                            value={nom}
                            onChange={(event) => setNom(event.target.value)}
                            required
                            maxLength={255}
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="niveau"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Niveau
                        </label>
                        <input
                            id="niveau"
                            type="text"
                            value={niveau}
                            onChange={(event) => setNiveau(event.target.value)}
                            required
                            maxLength={50}
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="annee_scolaire"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Année scolaire
                        </label>
                        <input
                            id="annee_scolaire"
                            type="text"
                            value={anneeScolaire}
                            onChange={(event) =>
                                setAnneeScolaire(event.target.value)
                            }
                            required
                            maxLength={20}
                            pattern="\d{4}-\d{4}"
                            title="Format attendu : AAAA-AAAA (ex. 2025-2026)"
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="capacite"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Capacité
                        </label>
                        <input
                            id="capacite"
                            type="number"
                            value={capacite}
                            onChange={(event) =>
                                setCapacite(event.target.value)
                            }
                            required
                            min={1}
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="id_utilisateur_principal"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Professeur principal
                        </label>
                        <Select
                            id="id_utilisateur_principal"
                            value={idUtilisateurPrincipal}
                            onChange={(event) =>
                                setIdUtilisateurPrincipal(event.target.value)
                            }
                        >
                            <option value="">— Aucun —</option>
                            {enseignants.map((enseignant) => (
                                <option
                                    key={enseignant.id}
                                    value={enseignant.id}
                                >
                                    {enseignant.prenom} {enseignant.nom}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="rounded border border-slate-200 p-4 dark:border-slate-800">
                        <h2 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Enseignants affectés
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Les enseignants affectés peuvent saisir les notes et
                            entrées de cette classe.
                        </p>

                        {assignSuccess && (
                            <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                                {assignSuccess}
                            </div>
                        )}

                        {assignError && (
                            <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                                {assignError}
                            </div>
                        )}

                        {enseignantsAffectes.length === 0 ? (
                            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                                Aucun enseignant affecté à cette classe.
                            </p>
                        ) : (
                            <ul className="mt-3 divide-y divide-slate-200 rounded border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                                {enseignantsAffectes.map((enseignant) => (
                                    <li
                                        key={enseignant.id}
                                        className="flex items-center justify-between gap-3 px-4 py-2.5"
                                    >
                                        <span className="text-sm text-slate-900 dark:text-slate-100">
                                            {enseignant.prenom}{' '}
                                            {enseignant.nom}
                                        </span>
                                        <Badge tone="default">
                                            Enseignant
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="mt-4 flex items-end gap-3">
                            <div className="flex-1">
                                <label
                                    htmlFor="enseignant-a-affecter"
                                    className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                                >
                                    Ajouter un enseignant
                                </label>
                                <Select
                                    id="enseignant-a-affecter"
                                    value={enseignantAajouter}
                                    onChange={(event) =>
                                        setEnseignantAajouter(
                                            event.target.value,
                                        )
                                    }
                                >
                                    <option value="">
                                        — Sélectionner un enseignant —
                                    </option>
                                    {enseignantsDisponibles.map(
                                        (enseignant) => (
                                            <option
                                                key={enseignant.id}
                                                value={enseignant.id}
                                            >
                                                {enseignant.prenom}{' '}
                                                {enseignant.nom}
                                            </option>
                                        ),
                                    )}
                                </Select>
                            </div>
                            <Button
                                type="button"
                                onClick={handleAssignEnseignant}
                                disabled={
                                    assignProcessing ||
                                    enseignantAajouter === ''
                                }
                            >
                                {assignProcessing
                                    ? 'Affectation...'
                                    : 'Ajouter'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            disabled={processing}
                        >
                            {processing
                                ? 'Enregistrement...'
                                : 'Enregistrer les modifications'}
                        </Button>
                        <a
                            href="/dashboard/admin/classes"
                            className="rounded-sm border border-slate-300 px-5 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
                        >
                            Annuler
                        </a>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
