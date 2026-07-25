<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'identifiant' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Custom error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'identifiant.required' => 'Veuillez saisir votre email ou votre nom d\'utilisateur.',
            'password.required' => 'Veuillez saisir votre mot de passe.',
        ];
    }
}
