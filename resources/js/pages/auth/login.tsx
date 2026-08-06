import { Head } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import FieldError from '@/components/ui/FieldError';
import Button from '@/components/ui/Button';
import { fieldClassName } from '@/lib/forms';

export default function Login() {
    const [identifiant, setIdentifiant] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setErrors({});
        setError(null);
        setProcessing(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ identifiant, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors(data.errors ?? {});
                if (!data.errors) {
                    setError(data.message ?? 'Identifiants incorrects.');
                }
                setProcessing(false);
                return;
            }

            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));

            const redirects: Record<string, string> = {
                admin: '/dashboard/admin',
                enseignant: '/dashboard/enseignant',
                direction: '/dashboard/direction',
                parent: '/dashboard/parent',
            };

            window.location.href = redirects[data.user.role] ?? '/';
        } catch {
            setError('Une erreur est survenue. Veuillez réessayer.');
            setProcessing(false);
        }
    }

    return (
        <>
            <Head title="Connexion" />
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
                <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                    <h1 className="mb-1 text-xl font-medium text-slate-900 dark:text-slate-100">
                        ScolarWatch
                    </h1>
                    <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                        Connectez-vous avec votre email ou nom d'utilisateur.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        className="flex flex-col gap-4"
                    >
                        <div>
                            <label
                                htmlFor="identifiant"
                                className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                            >
                                Email ou nom d'utilisateur
                            </label>
                            <input
                                id="identifiant"
                                type="text"
                                value={identifiant}
                                onChange={(e) => setIdentifiant(e.target.value)}
                                autoFocus
                                className={fieldClassName(
                                    Boolean(errors.identifiant),
                                )}
                            />
                            <FieldError message={errors.identifiant?.[0]} />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                            >
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={fieldClassName(
                                    Boolean(errors.password),
                                )}
                            />
                            <FieldError message={errors.password?.[0]} />
                        </div>

                        {error && <FieldError message={error} />}

                        <Button type="submit" disabled={processing}>
                            {processing ? 'Connexion...' : 'Se connecter'}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}
