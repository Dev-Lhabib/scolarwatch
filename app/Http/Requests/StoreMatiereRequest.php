<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMatiereRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $matiereId = $this->route('matiere')?->id_matiere;

        return [
            'nom' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', 'unique:matieres,code,'.$matiereId.',id_matiere'],
        ];
    }
}
