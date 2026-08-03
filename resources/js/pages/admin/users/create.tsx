import { FormEvent, useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { getAuthUser, apiFetch } from '@/lib/auth';
import AppLayout from '@/layouts/AppLayout';

const ROLES = [
    { value: 'admin', label: 'Admin' },
    { value: 'enseignant', label: 'Enseignant' },
    { value: 'direction', label: 'Direction' },
    { value: 'parent', label: 'Parent' },
];

export default function CreateUser() {
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [telephone, setTelephone] = useState('');
    const [adresse, setAdresse] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState('parent');
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
        setError(null);
        setSuccess(null);

        if (password !== passwordConfirmation) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setProcessing(true);

        try {
            const response = await apiFetch('/api/users', {
                method: 'POST',
                body: JSON.stringify({
                    nom,
                    prenom,
                    username,
                    email,
                    telephone: telephone || undefined,
                    adresse: adresse || undefined,
                    password,
                    role,
                }),
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

            setSuccess(`Utilisateur ${data.prenom} ${data.nom} créé avec succès.`);
            setNom('');
            setPrenom('');
            setUsername('');
            setEmail('');
            setTelephone('');
            setAdresse('');
            setPassword('');
            setPasswordConfirmation('');
            setRole('parent');
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
                    Créer un utilisateur
                </h1>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    Créez un nouveau compte pour un membre de l'établissement.
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
                    <div className="grid grid-cols-2 gap-4">
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
                                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="username"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Nom d'utilisateur
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="telephone"
                                className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                            >
                                Téléphone
                            </label>
                            <input
                                id="telephone"
                                type="tel"
                                value={telephone}
                                onChange={(e) => setTelephone(e.target.value)}
                                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="role"
                                className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                            >
                                Rôle
                            </label>
                            <Select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                {ROLES.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="adresse"
                            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                            Adresse
                        </label>
                        <textarea
                            id="adresse"
                            value={adresse}
                            onChange={(e) => setAdresse(e.target.value)}
                            rows={2}
                            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                                required
                                minLength={8}
                                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password_confirmation"
                                className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                            >
                                Confirmer le mot de passe
                            </label>
                            <input
                                id="password_confirmation"
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                required
                                minLength={8}
                                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                    >
                        {processing ? 'Création...' : "Créer l'utilisateur"}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
