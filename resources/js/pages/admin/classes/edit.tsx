import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Badge from '@/components/ui/Badge';
import FieldError from '@/components/ui/FieldError';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';
import { fieldClassName } from '@/lib/forms';

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
    const [assignErrors, setAssignErrors] = useState<Record<string, string[]>>(
        {},
    );
    const [assignError, setAssignError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
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
        setErrors({});
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
                setErrors(data.errors ?? {});
                if (!data.errors) {
                    setError(data.message ?? 'Erreur lors de la mise à jour.');
                }
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

        setAssignErrors({});
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
                setAssignErrors(data.errors ?? {});
                if (!data.errors) {
                    setAssignError(
                        data.message ?? "Erreur lors de l'affectation.",
                    );
                }
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
                <div className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                    Chargement...
                </div>
            </AppLayout>
        );
    }

    if (notFound) {
        return (
            <AppLayout>
                <div className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                    <h1 className="mb-1 text-xl font-medium text-slate-900 dark:text-slate-100">
                        Classe introuvable
                    </h1>
                    <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                        Cette classe n'existe pas ou n'est plus disponible.
                    </p>
                    <Button href="/dashboard/admin/classes">
                        Retour à la liste
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                <h1 className="mb-1 text-xl font-medium text-slate-900 dark:text-slate-100">
                    Modifier la classe
                </h1>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    Mettez à jour les informations de la classe {nom || ''}.
                </p>

                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="flex flex-col gap-4"
                >
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
                            className={fieldClassName(Boolean(errors.nom))}
                        />
                        <FieldError message={errors.nom?.[0]} />
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
                            className={fieldClassName(Boolean(errors.niveau))}
                        />
                        <FieldError message={errors.niveau?.[0]} />
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
                            className={fieldClassName(
                                Boolean(errors.annee_scolaire),
                            )}
                        />
                        <FieldError message={errors.annee_scolaire?.[0]} />
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
                            className={fieldClassName(Boolean(errors.capacite))}
                        />
                        <FieldError message={errors.capacite?.[0]} />
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
                            hasError={Boolean(errors.id_utilisateur_principal)}
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
                        <FieldError
                            message={errors.id_utilisateur_principal?.[0]}
                        />
                    </div>

                    {error && <FieldError message={error} />}

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
                                            {enseignant.prenom} {enseignant.nom}
                                        </span>
                                        <Badge tone="default">Enseignant</Badge>
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
                                    hasError={Boolean(
                                        assignErrors.id_utilisateur,
                                    )}
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
                                {assignError && (
                                    <FieldError message={assignError} />
                                )}
                                <FieldError
                                    message={assignErrors.id_utilisateur?.[0]}
                                />
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
                        <Button type="submit" disabled={processing}>
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
