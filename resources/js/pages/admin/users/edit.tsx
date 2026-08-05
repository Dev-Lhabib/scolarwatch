import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import FieldError from '@/components/ui/FieldError';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import AppLayout from '@/layouts/AppLayout';
import { apiFetch, getAuthUser } from '@/lib/auth';
import { fieldClassName } from '@/lib/forms';

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
        setErrors({});
        setError(null);

        const userId = userIdRef.current;

        if (userId == null) {
            return;
        }

        if (password !== passwordConfirmation) {
            setErrors({
                password_confirmation: [
                    'Les mots de passe ne correspondent pas.',
                ],
            });

            return;
        }

        if (password && password.length < 8) {
            setErrors({
                password: [
                    'Le mot de passe doit contenir au moins 8 caractères.',
                ],
            });

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
                setErrors(data.errors ?? {});
                if (!data.errors) {
                    setError(data.message ?? 'Erreur lors de la mise à jour.');
                }
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
                        Utilisateur introuvable
                    </h1>
                    <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                        Cet utilisateur n'existe pas ou n'est plus disponible.
                    </p>
                    <Button href="/admin/users">Retour à la liste</Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                <h1 className="mb-1 text-xl font-medium text-slate-900 dark:text-slate-100">
                    Modifier l'utilisateur
                </h1>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    Mettez à jour les informations du compte {username || ''}.
                </p>

                {isBootstrapAdmin && (
                    <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                        Compte administrateur principal : le rôle et le statut
                        actif ne peuvent pas être modifiés.
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="flex flex-col gap-4"
                >
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
                                onChange={(event) =>
                                    setPrenom(event.target.value)
                                }
                                className={fieldClassName(
                                    Boolean(errors.prenom),
                                )}
                            />
                            <FieldError message={errors.prenom?.[0]} />
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
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            className={fieldClassName(Boolean(errors.username))}
                        />
                        <FieldError message={errors.username?.[0]} />
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
                            onChange={(event) => setEmail(event.target.value)}
                            className={fieldClassName(Boolean(errors.email))}
                        />
                        <FieldError message={errors.email?.[0]} />
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
                                onChange={(event) =>
                                    setTelephone(event.target.value)
                                }
                                className={fieldClassName(
                                    Boolean(errors.telephone),
                                )}
                            />
                            <FieldError message={errors.telephone?.[0]} />
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
                                onChange={(event) =>
                                    setRole(event.target.value)
                                }
                                disabled={isBootstrapAdmin}
                                hasError={Boolean(errors.role)}
                                title={
                                    isBootstrapAdmin
                                        ? "Le rôle de l'administrateur principal ne peut pas être modifié."
                                        : undefined
                                }
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
                            <FieldError message={errors.role?.[0]} />
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
                            onChange={(event) => setAdresse(event.target.value)}
                            rows={2}
                            className={fieldClassName(Boolean(errors.adresse))}
                        />
                        <FieldError message={errors.adresse?.[0]} />
                    </div>

                    <label
                        className={`flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100 ${isBootstrapAdmin ? 'cursor-not-allowed opacity-50' : ''}`}
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
                            className="h-4 w-4 rounded border-slate-200 accent-indigo-600 disabled:cursor-not-allowed"
                        />
                        Compte actif
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
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
                                placeholder="Laisser vide pour conserver"
                                className={fieldClassName(
                                    Boolean(errors.password),
                                )}
                            />
                            <FieldError message={errors.password?.[0]} />
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
                                onChange={(event) =>
                                    setPasswordConfirmation(event.target.value)
                                }
                                placeholder="Laisser vide pour conserver"
                                className={fieldClassName(
                                    Boolean(errors.password_confirmation),
                                )}
                            />
                            <FieldError
                                message={errors.password_confirmation?.[0]}
                            />
                        </div>
                    </div>

                    {error && <FieldError message={error} />}

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Enregistrement...'
                                : 'Enregistrer les modifications'}
                        </Button>
                        <a
                            href="/admin/users"
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
