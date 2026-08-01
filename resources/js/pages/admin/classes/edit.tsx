import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
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
                const message = data.message
                    ? data.message
                    : data.errors
                      ? Object.values(data.errors).flat().join(', ')
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

    if (loading) {
        return (
            <AppLayout>
                <div className="mx-auto max-w-lg rounded-lg bg-white p-8 text-sm text-[#706f6c] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:text-[#A1A09A] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                    Chargement...
                </div>
            </AppLayout>
        );
    }

    if (notFound) {
        return (
            <AppLayout>
                <div className="mx-auto max-w-lg rounded-lg bg-white p-8 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                    <h1 className="mb-1 text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                        Classe introuvable
                    </h1>
                    <p className="mb-6 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        Cette classe n'existe pas ou n'est plus disponible.
                    </p>
                    <a
                        href="/dashboard/admin/classes"
                        className="rounded-sm border border-black bg-[#1b1b18] px-4 py-2 text-sm font-medium text-white hover:border-black hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                    >
                        Retour à la liste
                    </a>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="mx-auto max-w-lg rounded-lg bg-white p-8 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                <h1 className="mb-1 text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                    Modifier la classe
                </h1>
                <p className="mb-6 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    Mettez à jour les informations de la classe {nom || ''}.
                </p>

                {error && (
                    <div className="mb-4 rounded border border-[#f53003]/30 bg-[#f53003]/10 px-3 py-2 text-sm text-[#f53003] dark:text-[#FF4433]">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label
                            htmlFor="nom"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
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
                            className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="niveau"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
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
                            className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="annee_scolaire"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
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
                            className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="capacite"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
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
                            className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="id_utilisateur_principal"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Professeur principal
                        </label>
                        <select
                            id="id_utilisateur_principal"
                            value={idUtilisateurPrincipal}
                            onChange={(event) =>
                                setIdUtilisateurPrincipal(event.target.value)
                            }
                            className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
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
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-sm border border-black bg-[#1b1b18] px-5 py-2 text-sm font-medium text-white hover:border-black hover:bg-black disabled:opacity-50 dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                        >
                            {processing
                                ? 'Enregistrement...'
                                : 'Enregistrer les modifications'}
                        </button>
                        <a
                            href="/dashboard/admin/classes"
                            className="rounded-sm border border-[#e3e3e0] px-5 py-2 text-sm font-medium text-[#706f6c] hover:text-[#1b1b18] dark:border-[#3E3E3A] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                        >
                            Annuler
                        </a>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
