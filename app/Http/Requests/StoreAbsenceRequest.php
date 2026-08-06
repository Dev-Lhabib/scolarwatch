<?php

namespace App\Http\Requests;

use App\Models\Absence;
use Illuminate\Contracts\Validation\Validator;
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

    public function messages(): array
    {
        return [
            'date_absence.duplicate' => 'Cet élève a déjà une absence à cette date.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $data = $validator->getData();

                if (! isset($data['id_eleve'], $data['date_absence'])) {
                    return;
                }

                $query = Absence::query()
                    ->where('id_eleve', $data['id_eleve'])
                    ->whereDate('date_absence', $data['date_absence']);

                $absence = $this->route('absence');

                if ($absence instanceof Absence) {
                    $query->whereKeyNot($absence->getKey());
                }

                if ($query->exists()) {
                    $validator->errors()->add(
                        'date_absence',
                        'Cet élève a déjà une absence à cette date.',
                    );
                }
            },
        ];
    }
}
