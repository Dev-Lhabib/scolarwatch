import { Head } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

export default function Login() {
    const [identifiant, setIdentifiant] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
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
                setError(data.message ?? 'Identifiants incorrects.');
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
            <div className="flex min-h-screen items-center justify-center bg-[#FDFDFC] p-6 dark:bg-[#0a0a0a]">
                <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                    <h1 className="mb-1 text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                        ScolarWatch
                    </h1>
                    <p className="mb-6 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        Connectez-vous avec votre email ou nom d'utilisateur.
                    </p>

                    {error && (
                        <div className="mb-4 rounded border border-[#f53003]/30 bg-[#f53003]/10 px-3 py-2 text-sm text-[#f53003] dark:text-[#FF4433]">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label
                                htmlFor="identifiant"
                                className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                            >
                                Email ou nom d'utilisateur
                            </label>
                            <input
                                id="identifiant"
                                type="text"
                                value={identifiant}
                                onChange={(e) => setIdentifiant(e.target.value)}
                                required
                                autoFocus
                                className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                            >
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-2 rounded-sm border border-black bg-[#1b1b18] px-5 py-2 text-sm font-medium text-white hover:border-black hover:bg-black disabled:opacity-50 dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                        >
                            {processing ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
