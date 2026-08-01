import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

type Classe = {
    id_classe: number;
    nom: string;
};

type Parent = {
    id: number;
    prenom: string;
    nom: string;
    role: string;
};

export default function EditEleve() {
    const eleveIdRef = useRef<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [genre, setGenre] = useState('M');
    const [dateNaissance, setDateNaissance] = useState('');
    const [codeMassar, setCodeMassar] = useState('');
    const [idClasse, setIdClasse] = useState('');
    const [selectedTuteurs, setSelectedTuteurs] = useState<number[]>([]);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [parents, setParents] = useState<Parent[]>([]);
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
            window.location.href = '/dashboard/admin/eleves';

            return;
        }

        eleveIdRef.current = id;

        Promise.all([apiFetch('/api/classes'), apiFetch('/api/users')])
            .then(async ([classesRes, usersRes]) => {
                const classesData = await classesRes.json();
                setClasses(Array.isArray(classesData) ? classesData : []);

                const usersData = await usersRes.json();
                setParents(
                    usersData.filter(
                        (item: Parent) => item.role === 'parent',
                    ),
                );
            })
            .catch(() => {});

        apiFetch(`/api/eleves/${id}`)
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    setNotFound(true);

                    return;
                }

                setNom(data.nom);
                setPrenom(data.prenom);
                setGenre(data.genre);
                setDateNaissance(String(data.date_naissance).slice(0, 10));
                setCodeMassar(data.code_massar ?? '');
                setIdClasse(String(data.id_classe));
                setSelectedTuteurs(
                    Array.isArray(data.tuteurs)
                        ? data.tuteurs.map(
                              (tuteur: { id: number }) => tuteur.id,
                          )
                        : [],
                );
            })
            .catch(() => {
                setNotFound(true);
            })
            .finally(() => setLoading(false));
    }, []);

    function toggleTuteur(id: number) {
        setSelectedTuteurs((current) =>
            current.includes(id)
                ? current.filter((tuteurId) => tuteurId !== id)
                : [...current, id],
        );
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);

        const eleveId = eleveIdRef.current;

        if (eleveId == null) {
            return;
        }

        setProcessing(true);

        const payload: Record<string, string | number | number[]> = {
            nom,
            prenom,
            genre,
            date_naissance: dateNaissance,
            id_classe: Number(idClasse),
            tuteur_ids: selectedTuteurs,
        };

        if (codeMassar !== '') {
            payload.code_massar = codeMassar;
        }

        try {
            const response = await apiFetch(`/api/eleves/${eleveId}`, {
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

            window.location.href = '/dashboard/admin/eleves';
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
                        Élève introuvable
                    </h1>
                    <p className="mb-6 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        Cet élève n'existe pas ou n'est plus disponible.
                    </p>
                    <a
                        href="/dashboard/admin/eleves"
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
                    Modifier l'élève
                </h1>
                <p className="mb-6 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    Mettez à jour les informations de l'élève {prenom} {nom}.
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
                            htmlFor="prenom"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Prénom
                        </label>
                        <input
                            id="prenom"
                            type="text"
                            value={prenom}
                            onChange={(event) => setPrenom(event.target.value)}
                            required
                            maxLength={255}
                            className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="genre"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Genre
                        </label>
                        <select
                            id="genre"
                            value={genre}
                            onChange={(event) => setGenre(event.target.value)}
                            className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                        >
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="date_naissance"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Date de naissance
                        </label>
                        <input
                            id="date_naissance"
                            type="date"
                            value={dateNaissance}
                            onChange={(event) =>
                                setDateNaissance(event.target.value)
                            }
                            required
                            className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="code_massar"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Code Massar
                        </label>
                        <input
                            id="code_massar"
                            type="text"
                            value={codeMassar}
                            onChange={(event) =>
                                setCodeMassar(event.target.value)
                            }
                            maxLength={20}
                            className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="id_classe"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Classe
                        </label>
                        <select
                            id="id_classe"
                            value={idClasse}
                            onChange={(event) =>
                                setIdClasse(event.target.value)
                            }
                            required
                            className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                        >
                            <option value="">— Sélectionner une classe —</option>
                            {classes.map((classe) => (
                                <option
                                    key={classe.id_classe}
                                    value={classe.id_classe}
                                >
                                    {classe.nom}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <span className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                            Parents / tuteurs
                        </span>
                        <div className="max-h-48 overflow-y-auto rounded border border-[#e3e3e0] p-3 dark:border-[#3E3E3A]">
                            {parents.length === 0 && (
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    Aucun parent disponible.
                                </p>
                            )}
                            {parents.map((parent) => (
                                <label
                                    key={parent.id}
                                    className="flex cursor-pointer items-center gap-2 py-1 text-sm text-[#1b1b18] dark:text-[#EDEDEC]"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTuteurs.includes(
                                            parent.id,
                                        )}
                                        onChange={() => toggleTuteur(parent.id)}
                                        className="h-4 w-4"
                                    />
                                    {parent.prenom} {parent.nom}
                                </label>
                            ))}
                        </div>
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
                            href="/dashboard/admin/eleves"
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
