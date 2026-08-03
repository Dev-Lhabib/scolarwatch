import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Button from '@/components/ui/Button';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

export default function EditMatiere() {
    const matiereIdRef = useRef<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [nom, setNom] = useState('');
    const [code, setCode] = useState('');
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
            window.location.href = '/dashboard/admin/matieres';

            return;
        }

        matiereIdRef.current = id;

        apiFetch(`/api/matieres/${id}`)
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    setNotFound(true);

                    return;
                }

                setNom(data.nom);
                setCode(data.code);
            })
            .catch(() => {
                setNotFound(true);
            })
            .finally(() => setLoading(false));
    }, []);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);

        const matiereId = matiereIdRef.current;

        if (matiereId == null) {
            return;
        }

        setProcessing(true);

        try {
            const response = await apiFetch(`/api/matieres/${matiereId}`, {
                method: 'PUT',
                body: JSON.stringify({ nom, code }),
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

            window.location.href = '/dashboard/admin/matieres';
        } catch {
            setError('Une erreur est survenue. Veuillez réessayer.');
            setProcessing(false);
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
                        Matière introuvable
                    </h1>
                    <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                        Cette matière n'existe pas ou n'est plus disponible.
                    </p>
                    <Button
                        href="/dashboard/admin/matieres"
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
                    Modifier la matière
                </h1>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    Mettez à jour les informations de la matière {code || ''}.
                </p>

                {error && (
                    <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
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
                            htmlFor="code"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Code
                        </label>
                        <input
                            id="code"
                            type="text"
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            required
                            maxLength={20}
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
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
                            href="/dashboard/admin/matieres"
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
