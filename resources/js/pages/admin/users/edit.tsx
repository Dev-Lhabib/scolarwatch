import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Select from '@/components/ui/Select';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';

const ROLES = [
    { value: 'admin', label: 'Admin' },
    { value: 'enseignant', label: 'Enseignant' },
    { value: 'direction', label: 'Direction' },
    { value: 'parent', label: 'Parent' },
];

export default function EditUser() {
    const userIdRef = useRef<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [telephone, setTelephone] = useState('');
    const [adresse, setAdresse] = useState('');
    const [role, setRole] = useState('parent');
    const [isActive, setIsActive] = useState(true);
    const [isBootstrapAdmin, setIsBootstrapAdmin] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
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
            window.location.href = '/admin/users';

            return;
        }

        userIdRef.current = id;

        apiFetch(`/api/users/${id}`)
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    setNotFound(true);

                    return;
                }

                setNom(data.nom);
                setPrenom(data.prenom);
                setUsername(data.username);
                setEmail(data.email);
                setTelephone(data.telephone ?? '');
                setAdresse(data.adresse ?? '');
                setRole(data.role);
                setIsActive(Boolean(data.is_active));
                setIsBootstrapAdmin(Boolean(data.is_bootstrap_admin));
            })
            .catch(() => {
                setNotFound(true);
            })
            .finally(() => setLoading(false));
    }, []);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);

        const userId = userIdRef.current;

        if (userId == null) {
            return;
        }

        if (password !== passwordConfirmation) {
            setError('Les mots de passe ne correspondent pas.');

            return;
        }

        if (password && password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');

            return;
        }

        setProcessing(true);

        try {
            const payload: Record<string, string | boolean> = {
                nom,
                prenom,
                username,
                email,
                telephone: telephone || '',
                adresse: adresse || '',
                role,
                is_active: isActive,
            };

            if (password) {
                payload.password = password;
            }

            const response = await apiFetch(`/api/users/${userId}`, {
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

            window.location.href = '/admin/users';
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
                        Utilisateur introuvable
                    </h1>
                    <p className="mb-6 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        Cet utilisateur n'existe pas ou n'est plus disponible.
                    </p>
                    <a
                        href="/admin/users"
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
                    Modifier l'utilisateur
                </h1>
                <p className="mb-6 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    Mettez à jour les informations du compte {username || ''}.
                </p>

                {isBootstrapAdmin && (
                    <div className="mb-4 rounded border border-[#f53003]/30 bg-[#f53003]/10 px-3 py-2 text-sm text-[#f53003] dark:text-[#FF4433]">
                        Compte administrateur principal : le rôle et le statut
                        actif ne peuvent pas être modifiés.
                    </div>
                )}

                {error && (
                    <div className="mb-4 rounded border border-[#f53003]/30 bg-[#f53003]/10 px-3 py-2 text-sm text-[#f53003] dark:text-[#FF4433]">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
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
                                onChange={(event) =>
                                    setPrenom(event.target.value)
                                }
                                required
                                className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="username"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Nom d'utilisateur
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            required
                            className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="telephone"
                                className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                            >
                                Téléphone
                            </label>
                            <input
                                id="telephone"
                                type="tel"
                                value={telephone}
                                onChange={(event) =>
                                    setTelephone(event.target.value)
                                }
                                className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="role"
                                className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                            >
                                Rôle
                            </label>
                            <Select
                                id="role"
                                value={role}
                                onChange={(event) =>
                                    setRole(event.target.value)
                                }
                                disabled={isBootstrapAdmin}
                                title={
                                    isBootstrapAdmin
                                        ? "Le rôle de l'administrateur principal ne peut pas être modifié."
                                        : undefined
                                }
                                required
                            >
                                {ROLES.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="adresse"
                            className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                        >
                            Adresse
                        </label>
                        <textarea
                            id="adresse"
                            value={adresse}
                            onChange={(event) => setAdresse(event.target.value)}
                            rows={2}
                            className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                        />
                    </div>

                    <label
                        className={`flex items-center gap-2 text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC] ${isBootstrapAdmin ? 'cursor-not-allowed opacity-50' : ''}`}
                        title={
                            isBootstrapAdmin
                                ? 'Le compte administrateur principal doit rester actif.'
                                : undefined
                        }
                    >
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(event) =>
                                setIsActive(event.target.checked)
                            }
                            disabled={isBootstrapAdmin}
                            className="h-4 w-4 rounded border-[#e3e3e0] accent-[#f53003] disabled:cursor-not-allowed"
                        />
                        Compte actif
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                            >
                                Nouveau mot de passe
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                minLength={8}
                                placeholder="Laisser vide pour conserver"
                                className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password_confirmation"
                                className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                            >
                                Confirmer le mot de passe
                            </label>
                            <input
                                id="password_confirmation"
                                type="password"
                                value={passwordConfirmation}
                                onChange={(event) =>
                                    setPasswordConfirmation(event.target.value)
                                }
                                minLength={8}
                                placeholder="Laisser vide pour conserver"
                                className="w-full rounded border border-[#e3e3e0] bg-transparent px-3 py-2 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                            />
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
                            href="/admin/users"
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
