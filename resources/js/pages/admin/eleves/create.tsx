import { useEffect, useState } from 'react';
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
            <div className="mx-auto max-w-lg rounded-lg bg-white p-8 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                <h1 className="mb-1 text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                    Créer un élève
                </h1>
                <p className="mb-6 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    Ajoutez un nouvel élève à l'établissement.
                </p>

                {error && (
                    <div className="mb-4 rounded border border-[#f53003]/30 bg-[#f53003]/10 px-3 py-2 text-sm text-[#f53003] dark:text-[#FF4433]">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
                        {success}
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
                            onChange={(e) => setNom(e.target.value)}
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
                            onChange={(e) => setPrenom(e.target.value)}
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
                            onChange={(e) => setGenre(e.target.value)}
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
                            onChange={(e) => setDateNaissance(e.target.value)}
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
                            onChange={(e) => setCodeMassar(e.target.value)}
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
                            onChange={(e) => setIdClasse(e.target.value)}
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

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-2 rounded-sm border border-black bg-[#1b1b18] px-5 py-2 text-sm font-medium text-white hover:border-black hover:bg-black disabled:opacity-50 dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                    >
                        {processing ? 'Création...' : 'Créer l\'élève'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
