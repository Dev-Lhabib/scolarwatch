<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\Eleve;
use App\Models\Note;
use App\Models\Remarque;
use App\Models\Retard;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentController extends Controller
{
    /**
     * The eleves for which the authenticated user is a tuteur, with their classe.
     * Scoped to the authenticated parent only.
     */
    public function children(): JsonResponse
    {
        return response()->json(
            auth()->user()->eleves()->with('classe')->get()
        );
    }

    /**
     * The notes of the authenticated parent's children.
     */
    public function notes(Request $request): JsonResponse
    {
        return response()->json(
            $this->recordsForChildren(Note::query(), 'date', $request)
                ->with('matiere')
                ->get()
        );
    }

    /**
     * The absences of the authenticated parent's children.
     */
    public function absences(Request $request): JsonResponse
    {
        return response()->json(
            $this->recordsForChildren(Absence::query(), 'date_absence', $request)->get()
        );
    }

    /**
     * The retards of the authenticated parent's children.
     */
    public function retards(Request $request): JsonResponse
    {
        return response()->json(
            $this->recordsForChildren(Retard::query(), 'date_retard', $request)->get()
        );
    }

    /**
     * The remarques of the authenticated parent's children.
     */
    public function remarques(Request $request): JsonResponse
    {
        return response()->json(
            $this->recordsForChildren(Remarque::query(), 'date_remarque', $request)->get()
        );
    }

    /**
     * Scope a record query to the authenticated parent's own children, optionally
     * restricted to a single child via the id_eleve query parameter. Any id_eleve
     * outside the parent's perimeter is rejected with a 403.
     *
     * @template T of \Illuminate\Database\Eloquent\Model
     *
     * @param  Builder<T>  $query
     * @return Builder<T>
     */
    private function recordsForChildren($query, string $dateColumn, Request $request)
    {
        $query->whereIn('id_eleve', $this->childIds())->latest($dateColumn);

        if ($request->filled('id_eleve')) {
            $idEleve = $request->integer('id_eleve');
            $eleve = Eleve::find($idEleve);

            abort_unless($eleve !== null, 403);

            $this->authorize('view', $eleve);

            $query->where('id_eleve', $idEleve);
        }

        return $query;
    }

    /**
     * The ids of the eleves for which the authenticated user is a tuteur.
     *
     * @return array<int, int>
     */
    private function childIds(): array
    {
        return auth()->user()->eleves()->pluck('eleves.id_eleve')->all();
    }
}
