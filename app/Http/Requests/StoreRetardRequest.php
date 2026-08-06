<?php

namespace App\Http\Requests;

use App\Models\Retard;
use Illuminate\Contracts\Validation\Validator;
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

    public function messages(): array
    {
        return [
            'date_retard.duplicate' => 'Cet élève a déjà un retard à cette date.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $data = $validator->getData();

                if (! isset($data['id_eleve'], $data['date_retard'])) {
                    return;
                }

                $query = Retard::query()
                    ->where('id_eleve', $data['id_eleve'])
                    ->whereDate('date_retard', $data['date_retard']);

                $retard = $this->route('retard');

                if ($retard instanceof Retard) {
                    $query->whereKeyNot($retard->getKey());
                }

                if ($query->exists()) {
                    $validator->errors()->add(
                        'date_retard',
                        'Cet élève a déjà un retard à cette date.',
                    );
                }
            },
        ];
    }
}
