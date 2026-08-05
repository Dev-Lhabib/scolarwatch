<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClasseRequest extends FormRequest
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
            'nom' => [
                'required',
                'string',
                'max:255',
                Rule::unique('classes', 'nom')
                    ->ignore($this->route('classe'))
                    ->where(fn ($query) => $query->where('annee_scolaire', $this->input('annee_scolaire'))),
            ],
            'niveau' => ['required', 'string', 'max:50'],
            'annee_scolaire' => [
                'required',
                'string',
                'max:20',
                'regex:/\A\d{4}-\d{4}\z/',
            ],
            'capacite' => ['required', 'integer', 'min:1'],
            'id_utilisateur_principal' => ['nullable', 'exists:users,id'],
        ];
    }
}
