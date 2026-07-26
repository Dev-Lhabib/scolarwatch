<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRetardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date_retard' => ['required', 'date'],
            'justifiee' => ['boolean'],
            'minutes_retard' => ['required', 'integer', 'min:1'],
            'motif' => ['nullable', 'string', 'max:255'],
            'id_eleve' => ['required', 'exists:eleves,id_eleve'],
        ];
    }
}
