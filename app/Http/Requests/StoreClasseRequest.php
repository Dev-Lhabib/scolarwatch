<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClasseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Authorization is handled by ClassePolicy via $this->authorize() in the controller.
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
            'nom' => ['required', 'string', 'max:255'],
            'niveau' => ['required', 'string', 'max:50'],
            'annee_scolaire' => ['required', 'string', 'max:20'],
            'capacite' => ['required', 'integer', 'min:1'],
            'id_utilisateur_principal' => ['nullable', 'exists:users,id'],
        ];
    }
}
