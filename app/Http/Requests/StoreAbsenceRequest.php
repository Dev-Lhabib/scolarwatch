<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAbsenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date_absence' => ['required', 'date'],
            'justifiee' => ['boolean'],
            'motif' => ['nullable', 'string', 'max:255'],
            'id_eleve' => ['required', 'exists:eleves,id_eleve'],
        ];
    }
}
