<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNoteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Authorization is handled by NotePolicy via $this->authorize() in the controller.
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
            'valeur' => ['required', 'numeric', 'min:0', 'max:20'],
            'trimestre' => ['required', 'string', 'max:20'],
            'date' => ['required', 'date'],
            'id_eleve' => ['required', 'exists:eleves,id_eleve'],
            'id_matiere' => ['required', 'exists:matieres,id_matiere'],
        ];
    }
}
