export type AuthUser = {
    id: number;
    nom: string;
    prenom: string;
    username: string;
    email: string;
    role: 'admin' | 'enseignant' | 'direction' | 'parent';
};

export function getAuthUser(): AuthUser | null {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
}

export function getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
}

export function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
}

export async function apiFetch(url: string, options: RequestInit = {}) {
    const token = getAuthToken();
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    if (response.status === 401) {
        logout();
        throw new Error('Unauthenticated');
    }
    return response;
}
