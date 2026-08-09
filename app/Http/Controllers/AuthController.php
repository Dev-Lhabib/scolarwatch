<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate the user and issue a Sanctum token.
     *
     * L'identifiant peut être une adresse email ou un nom d'utilisateur. L'endpoint
     * est limité à 6 requêtes par minute.
     *
     * @group Authentication
     *
     * @unauthenticated
     *
     * @bodyParam identifiant string required Email ou nom d'utilisateur du compte.
     * @bodyParam password string required Mot de passe du compte.
     *
     * @response {
     *  "user": {
     *      "id": 1,
     *      "nom": "Admin",
     *      "prenom": "ScolarWatch",
     *      "username": "admin",
     *      "telephone": null,
     *      "adresse": null,
     *      "role": "admin",
     *      "is_active": true,
     *      "id_matiere": null,
     *      "email": "admin@scolarwatch.test",
     *      "created_at": "2025-09-01T09:00:00.000000Z",
     *      "updated_at": "2025-09-01T09:00:00.000000Z",
     *      "is_bootstrap_admin": true
     *  },
     *  "token": "1|abc123..."
     * }
     * @response status=422 scenario="Identifiants incorrects" {
     *  "message": "Identifiants incorrects.",
     *  "errors": {
     *      "identifiant": ["Identifiants incorrects."]
     *  }
     * }
     * @response status=422 scenario="Compte désactivé" {
     *  "message": "Ce compte a été désactivé.",
     *  "errors": {
     *      "identifiant": ["Ce compte a été désactivé."]
     *  }
     * }
     */
    public function login(LoginRequest $request)
    {
        $identifiant = $request->validated('identifiant');
        $password = $request->validated('password');

        $field = filter_var($identifiant, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($field, $identifiant)->first();

        if (! $user || ! Auth::attempt([$field => $identifiant, 'password' => $password])) {
            throw ValidationException::withMessages([
                'identifiant' => ['Identifiants incorrects.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'identifiant' => ['Ce compte a été désactivé.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Revoke the current access token.
     *
     * @group Authentication
     *
     * @response {
     *  "message": "Déconnexion réussie."
     * }
     */
    public function logout()
    {
        auth()->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }
}
