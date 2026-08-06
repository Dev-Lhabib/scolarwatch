import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Button from '@/components/ui/Button';
import FieldError from '@/components/ui/FieldError';
import Select from '@/components/ui/Select';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';
import { fieldClassName } from '@/lib/forms';

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
                    usersData.filter((item: Parent) => item.role === 'parent'),
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
        setErrors({});
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
                setErrors(data.errors ?? {});

                if (!data.errors) {
                    setError(data.message ?? 'Erreur lors de la mise à jour.');
                }

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
                        Élève introuvable
                    </h1>
                    <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                        Cet élève n'existe pas ou n'est plus disponible.
                    </p>
                    <Button href="/dashboard/admin/eleves">
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
                    Modifier l'élève
                </h1>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    Mettez à jour les informations de l'élève {prenom} {nom}.
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
                            htmlFor="prenom"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Prénom
                        </label>
                        <input
                            id="prenom"
                            type="text"
                            value={prenom}
                            onChange={(event) => setPrenom(event.target.value)}
                            className={fieldClassName(Boolean(errors.prenom))}
                        />
                        <FieldError message={errors.prenom?.[0]} />
                    </div>

                    <div>
                        <label
                            htmlFor="genre"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Genre
                        </label>
                        <Select
                            id="genre"
                            value={genre}
                            onChange={(event) => setGenre(event.target.value)}
                            hasError={Boolean(errors.genre)}
                        >
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                        </Select>
                        <FieldError message={errors.genre?.[0]} />
                    </div>

                    <div>
                        <label
                            htmlFor="date_naissance"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
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
                            className={fieldClassName(
                                Boolean(errors.date_naissance),
                            )}
                        />
                        <FieldError message={errors.date_naissance?.[0]} />
                    </div>

                    <div>
                        <label
                            htmlFor="code_massar"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
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
                            className={fieldClassName(
                                Boolean(errors.code_massar),
                            )}
                        />
                        <FieldError message={errors.code_massar?.[0]} />
                    </div>

                    <div>
                        <label
                            htmlFor="id_classe"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Classe
                        </label>
                        <Select
                            id="id_classe"
                            value={idClasse}
                            onChange={(event) =>
                                setIdClasse(event.target.value)
                            }
                            hasError={Boolean(errors.id_classe)}
                        >
                            <option value="">
                                — Sélectionner une classe —
                            </option>
                            {classes.map((classe) => (
                                <option
                                    key={classe.id_classe}
                                    value={classe.id_classe}
                                >
                                    {classe.nom}
                                </option>
                            ))}
                        </Select>
                        <FieldError message={errors.id_classe?.[0]} />
                    </div>

                    <div>
                        <span className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100">
                            Parents / tuteurs
                        </span>
                        <div className="max-h-48 overflow-y-auto rounded border border-slate-200 p-3 dark:border-slate-800">
                            {parents.length === 0 && (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Aucun parent disponible.
                                </p>
                            )}
                            {parents.map((parent) => (
                                <label
                                    key={parent.id}
                                    className="flex cursor-pointer items-center gap-2 py-1 text-sm text-slate-900 dark:text-slate-100"
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
                        <FieldError message={errors.tuteur_ids?.[0]} />
                    </div>

                    {error && <FieldError message={error} />}

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Enregistrement...'
                                : 'Enregistrer les modifications'}
                        </Button>
                        <Button
                            type="button"
                            tone="secondary"
                            href="/dashboard/admin/eleves"
                        >
                            Annuler
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
