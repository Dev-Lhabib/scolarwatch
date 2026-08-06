import { useEffect, useState } from 'react';
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

export default function CreateEleve() {
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
    const [success, setSuccess] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const user = getAuthUser();

        if (!user || user.role !== 'admin') {
            window.location.href = '/login';

            return;
        }

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
    }, []);

    function toggleTuteur(id: number) {
        setSelectedTuteurs((current) =>
            current.includes(id)
                ? current.filter((tuteurId) => tuteurId !== id)
                : [...current, id],
        );
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setErrors({});
        setError(null);
        setSuccess(null);
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
            const response = await apiFetch('/api/eleves', {
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

            setSuccess(
                `Élève « ${data.prenom} ${data.nom} » créé avec succès.`,
            );
            setNom('');
            setPrenom('');
            setGenre('M');
            setDateNaissance('');
            setCodeMassar('');
            setIdClasse('');
            setSelectedTuteurs([]);
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
                    Créer un élève
                </h1>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    Ajoutez un nouvel élève à l'établissement.
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
                            htmlFor="prenom"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Prénom
                        </label>
                        <input
                            id="prenom"
                            type="text"
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
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
                            onChange={(e) => setGenre(e.target.value)}
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
                            onChange={(e) => setDateNaissance(e.target.value)}
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
                            onChange={(e) => setCodeMassar(e.target.value)}
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
                            onChange={(e) => setIdClasse(e.target.value)}
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
                            {processing ? 'Création...' : "Créer l'élève"}
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
