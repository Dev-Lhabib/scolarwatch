import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
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

export default function CreateClasse() {
    const [nom, setNom] = useState('');
    const [niveau, setNiveau] = useState('');
    const [anneeScolaire, setAnneeScolaire] = useState('');
    const [capacite, setCapacite] = useState('');
    const [idUtilisateurPrincipal, setIdUtilisateurPrincipal] = useState('');
    const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const user = getAuthUser();

        if (!user || user.role !== 'admin') {
            window.location.href = '/login';

            return;
        }

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
    }, []);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setErrors({});
        setError(null);
        setSuccess(null);
        setProcessing(true);

        const payload: Record<string, string | number> = {
            nom,
            niveau,
            annee_scolaire: anneeScolaire,
            capacite: Number(capacite),
        };

        if (idUtilisateurPrincipal !== '') {
            payload.id_utilisateur_principal = Number(idUtilisateurPrincipal);
        }

        try {
            const response = await apiFetch('/api/classes', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors(data.errors ?? {});
                if (!data.errors) {
                    setError(data.message ?? 'Erreur lors de la création.');
                }
                setProcessing(false);

                return;
            }

            setSuccess(`Classe « ${data.nom} » créée avec succès.`);
            setNom('');
            setNiveau('');
            setAnneeScolaire('');
            setCapacite('');
            setIdUtilisateurPrincipal('');
            setProcessing(false);
        } catch {
            setError('Une erreur est survenue. Veuillez réessayer.');
            setProcessing(false);
        }
    }

    return (
        <AppLayout>
            <div className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                <h1 className="mb-1 text-xl font-medium text-slate-900 dark:text-slate-100">
                    Créer une classe
                </h1>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    Ajoutez une nouvelle classe à l'établissement.
                </p>

                {success && (
                    <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                        {success}
                    </div>
                )}

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
                            onChange={(e) => setNom(e.target.value)}
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
                            onChange={(e) => setNiveau(e.target.value)}
                            placeholder="Ex. 1AC, 2AC, 3AC..."
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
                            onChange={(e) => setAnneeScolaire(e.target.value)}
                            placeholder="Ex. 2025-2026"
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
                            onChange={(e) => setCapacite(e.target.value)}
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
                            onChange={(e) =>
                                setIdUtilisateurPrincipal(e.target.value)
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

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Création...' : 'Créer la classe'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
