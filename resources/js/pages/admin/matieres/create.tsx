import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import FieldError from '@/components/ui/FieldError';
import Button from '@/components/ui/Button';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';
import { fieldClassName } from '@/lib/forms';

export default function CreateMatiere() {
    const [nom, setNom] = useState('');
    const [code, setCode] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const user = getAuthUser();

        if (!user || user.role !== 'admin') {
            window.location.href = '/login';
        }
    }, []);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setErrors({});
        setError(null);
        setSuccess(null);
        setProcessing(true);

        try {
            const response = await apiFetch('/api/matieres', {
                method: 'POST',
                body: JSON.stringify({ nom, code }),
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

            setSuccess(`Matière « ${data.nom} » créée avec succès.`);
            setNom('');
            setCode('');
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
                    Créer une matière
                </h1>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    Ajoutez une nouvelle matière à l'établissement.
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
                            maxLength={255}
                            className={fieldClassName(Boolean(errors.nom))}
                        />
                        <FieldError message={errors.nom?.[0]} />
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
                            onChange={(e) => setCode(e.target.value)}
                            maxLength={20}
                            className={fieldClassName(Boolean(errors.code))}
                        />
                        <FieldError message={errors.code?.[0]} />
                    </div>

                    {error && <FieldError message={error} />}

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Création...' : 'Créer la matière'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
