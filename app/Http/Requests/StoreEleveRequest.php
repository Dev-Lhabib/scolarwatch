<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEleveRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Authorization is handled by ElevePolicy via $this->authorize() in the controller.
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
            'prenom' => ['required', 'string', 'max:255'],
            'genre' => ['required', 'string', 'in:M,F'],
            'date_naissance' => ['required', 'date', 'before:today'],
            'code_massar' => ['nullable', 'string', 'max:20'],
            'photo' => ['nullable', 'string'],
            'id_classe' => ['required', 'exists:classes,id_classe'],
            'tuteur_ids' => ['nullable', 'array'],
            'tuteur_ids.*' => ['exists:users,id'],
        ];
    }
}
