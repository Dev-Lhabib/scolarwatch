import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
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
                    usersData.filter(
                        (item: Parent) => item.role === 'parent',
                    ),
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
                const message = data.message
                    ? data.message
                    : data.errors
                      ? Object.values(data.errors).flat().join(', ')
                      : 'Erreur lors de la création.';
                setError(message);
                setProcessing(false);

                return;
            }

            setSuccess(`Élève « ${data.prenom} ${data.nom} » créé avec succès.`);
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
            <div className="mx-auto max-w-lg rounded-lg bg-white p-8 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <h1 className="mb-1 text-xl font-medium text-slate-900 dark:text-slate-100">
                    Créer un élève
                </h1>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    Ajoutez un nouvel élève à l'établissement.
                </p>

                {error && (
                    <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                        {success}
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
                            onChange={(e) => setNom(e.target.value)}
                            required
                            maxLength={255}
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
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
                            required
                            maxLength={255}
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
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
                        >
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                        </Select>
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
                            required
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
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
                            maxLength={20}
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
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
                            required
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
                        </Select>
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
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                    >
                        {processing ? 'Création...' : 'Créer l\'élève'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
