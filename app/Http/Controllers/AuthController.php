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
     */
    public function logout()
    {
        auth()->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }
}
