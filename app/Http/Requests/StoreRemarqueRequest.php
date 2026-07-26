<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRemarqueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contenu' => ['required', 'string'],
            'categorie' => ['nullable', 'string', 'max:100'],
            'trimestre' => ['required', 'string', 'max:20'],
            'date_remarque' => ['required', 'date'],
            'id_eleve' => ['required', 'exists:eleves,id_eleve'],
        ];
    }
}
