<?php

namespace App\Http\Requests;

use App\Models\Note;
use Illuminate\Contracts\Validation\Validator;
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
            'trimestre' => ['required', 'string', 'in:T1,T2,T3', 'max:20'],
            'date' => ['required', 'date'],
            'id_eleve' => ['required', 'exists:eleves,id_eleve'],
            'id_matiere' => ['required', 'exists:matieres,id_matiere'],
        ];
    }

    public function messages(): array
    {
        return [
            'id_eleve.duplicate' => 'Une note existe déjà pour cet élève, cette matière, ce trimestre et cette date.',
            'valeur.max_notes' => 'Cet élève a déjà 4 notes pour ce trimestre et cette matière.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $data = $validator->getData();

                if (! isset($data['id_eleve'], $data['id_matiere'], $data['trimestre'], $data['date'])) {
                    return;
                }

                $query = Note::query()
                    ->where('id_eleve', $data['id_eleve'])
                    ->where('id_matiere', $data['id_matiere'])
                    ->where('trimestre', $data['trimestre'])
                    ->whereDate('date', $data['date']);

                $note = $this->route('note');

                if ($note instanceof Note) {
                    $query->whereKeyNot($note->getKey());
                }

                if ($query->exists()) {
                    $validator->errors()->add(
                        'id_eleve',
                        'Une note existe déjà pour cet élève, cette matière, ce trimestre et cette date.',
                    );
                }
            },
            function (Validator $validator) {
                $data = $validator->getData();

                if (! isset($data['id_eleve'], $data['id_matiere'], $data['trimestre'])) {
                    return;
                }

                $count = Note::query()
                    ->where('id_eleve', $data['id_eleve'])
                    ->where('id_matiere', $data['id_matiere'])
                    ->where('trimestre', $data['trimestre']);

                $note = $this->route('note');

                if ($note instanceof Note) {
                    $count->whereKeyNot($note->getKey());
                }

                if ($count->count() >= 4) {
                    $validator->errors()->add(
                        'valeur',
                        'Cet élève a déjà 4 notes pour ce trimestre et cette matière.',
                    );
                }
            },
        ];
    }
}
