<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Gestion des utilisateurs (comptes de l'établissement) et de leur archivage.
 *
 * @group Utilisateurs
 */
class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @subgroup Gestion
     *
     * @response {
     *  "id": 1,
     *  "nom": "Admin",
     *  "prenom": "ScolarWatch",
     *  "username": "admin",
     *  "telephone": null,
     *  "adresse": null,
     *  "role": "admin",
     *  "is_active": true,
     *  "id_matiere": null,
     *  "email": "admin@scolarwatch.test",
     *  "created_at": "2025-09-01T09:00:00.000000Z",
     *  "updated_at": "2025-09-01T09:00:00.000000Z",
     *  "is_bootstrap_admin": true
     * }
     */
    public function index()
    {
        $this->authorize('viewAny', User::class);

        return response()->json(User::all());
    }

    /**
     * Store a newly created user in storage.
     *
     * @subgroup Gestion
     *
     * @response status=201 {
     *  "id": 4,
     *  "nom": "Doe",
     *  "prenom": "Jean",
     *  "username": "jdoe",
     *  "telephone": "0661234567",
     *  "adresse": "12 rue de l'école",
     *  "role": "enseignant",
     *  "is_active": true,
     *  "id_matiere": 1,
     *  "email": "jean.doe@scolarwatch.test",
     *  "created_at": "2025-09-01T10:00:00.000000Z",
     *  "updated_at": "2025-09-01T10:00:00.000000Z",
     *  "is_bootstrap_admin": false
     * }
     */
    public function store(StoreUserRequest $request)
    {
        $this->authorize('create', [User::class, $request->validated()]);

        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        return response()->json($user, 201);
    }

    /**
     * Display the specified user.
     *
     * @subgroup Gestion
     *
     * @urlParam user integer required L'ID de l'utilisateur. Example: 4
     *
     * @response {
     *  "id": 4,
     *  "nom": "Doe",
     *  "prenom": "Jean",
     *  "username": "jdoe",
     *  "telephone": "0661234567",
     *  "adresse": "12 rue de l'école",
     *  "role": "enseignant",
     *  "is_active": true,
     *  "id_matiere": 1,
     *  "email": "jean.doe@scolarwatch.test",
     *  "created_at": "2025-09-01T10:00:00.000000Z",
     *  "updated_at": "2025-09-01T10:00:00.000000Z",
     *  "is_bootstrap_admin": false
     * }
     */
    public function show(User $user)
    {
        $this->authorize('view', $user);

        return response()->json($user);
    }

    /**
     * Display a listing of soft-deleted (archived) users.
     *
     * @subgroup Archivage
     *
     * @response [
     *  {
     *      "id": 7,
     *      "nom": "Martin",
     *      "prenom": "Claire",
     *      "username": "cmartin",
     *      "telephone": null,
     *      "adresse": null,
     *      "role": "parent",
     *      "is_active": false,
     *      "id_matiere": null,
     *      "email": "claire.martin@scolarwatch.test",
     *      "created_at": "2025-09-01T09:00:00.000000Z",
     *      "updated_at": "2025-09-05T09:00:00.000000Z",
     *      "is_bootstrap_admin": false,
     *      "deleted_at": "2025-09-10T09:00:00.000000Z"
     *  }
     * ]
     */
    public function archived()
    {
        $this->authorize('viewAny', User::class);

        return response()->json(User::onlyTrashed()->get());
    }

    /**
     * Restore a soft-deleted (archived) user.
     *
     * @subgroup Archivage
     *
     * @urlParam user integer required L'ID de l'utilisateur archivé. Example: 7
     *
     * @response {
     *  "id": 7,
     *  "nom": "Martin",
     *  "prenom": "Claire",
     *  "username": "cmartin",
     *  "telephone": null,
     *  "adresse": null,
     *  "role": "parent",
     *  "is_active": false,
     *  "id_matiere": null,
     *  "email": "claire.martin@scolarwatch.test",
     *  "created_at": "2025-09-01T09:00:00.000000Z",
     *  "updated_at": "2025-09-05T09:00:00.000000Z",
     *  "is_bootstrap_admin": false,
     *  "deleted_at": null
     * }
     */
    public function restore(User $user)
    {
        $this->authorize('restore', $user);

        $user->restore();

        return response()->json($user);
    }

    /**
     * Permanently delete a soft-deleted (archived) user.
     *
     * @subgroup Archivage
     *
     * @urlParam user integer required L'ID de l'utilisateur archivé. Example: 7
     *
     * @response status=204
     */
    public function forceDelete(User $user)
    {
        $this->authorize('forceDelete', $user);

        $user->forceDelete();

        return response()->json(null, 204);
    }

    /**
     * Archive (soft-delete) multiple users in one request.
     *
     * @subgroup Archivage
     *
     * @bodyParam ids integer[] required Les IDs des utilisateurs à archiver. Example: [4,7]
     *
     * @response status=204
     */
    public function bulkArchive(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $users = User::whereIn('id', $validated['ids'])->get();

        foreach ($users as $user) {
            $this->authorize('delete', $user);
        }

        $users->each->delete();

        return response()->json(null, 204);
    }

    /**
     * Restore multiple archived users in one request.
     *
     * @subgroup Archivage
     *
     * @bodyParam ids integer[] required Les IDs des utilisateurs archivés à restaurer. Example: [4,7]
     *
     * @response [
     *  {
     *      "id": 4,
     *      "nom": "Doe",
     *      "prenom": "Jean",
     *      "username": "jdoe",
     *      "telephone": "0661234567",
     *      "adresse": "12 rue de l'école",
     *      "role": "enseignant",
     *      "is_active": true,
     *      "id_matiere": 1,
     *      "email": "jean.doe@scolarwatch.test",
     *      "created_at": "2025-09-01T10:00:00.000000Z",
     *      "updated_at": "2025-09-01T10:00:00.000000Z",
     *      "is_bootstrap_admin": false,
     *      "deleted_at": null
     *  }
     * ]
     */
    public function bulkRestore(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $users = User::onlyTrashed()->whereIn('id', $validated['ids'])->get();

        foreach ($users as $user) {
            $this->authorize('restore', $user);
        }

        $users->each->restore();

        return response()->json($users);
    }

    /**
     * Permanently delete multiple archived users in one request.
     *
     * @subgroup Archivage
     *
     * @bodyParam ids integer[] required Les IDs des utilisateurs archivés à supprimer définitivement. Example: [4,7]
     *
     * @response status=204
     */
    public function bulkForceDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $users = User::onlyTrashed()->whereIn('id', $validated['ids'])->get();

        foreach ($users as $user) {
            $this->authorize('forceDelete', $user);
        }

        $users->each->forceDelete();

        return response()->json(null, 204);
    }

    /**
     * Update the specified user in storage.
     *
     * Le mot de passe est facultatif : s'il est vide, il reste inchangé.
     *
     * @subgroup Gestion
     *
     * @urlParam user integer required L'ID de l'utilisateur à modifier. Example: 4
     *
     * @response {
     *  "id": 4,
     *  "nom": "Doe",
     *  "prenom": "Jean",
     *  "username": "jdoe",
     *  "telephone": "0661234567",
     *  "adresse": "12 rue de l'école",
     *  "role": "enseignant",
     *  "is_active": true,
     *  "id_matiere": 1,
     *  "email": "jean.doe@scolarwatch.test",
     *  "created_at": "2025-09-01T10:00:00.000000Z",
     *  "updated_at": "2025-09-02T08:30:00.000000Z",
     *  "is_bootstrap_admin": false
     * }
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $this->authorize('update', [$user, $request->validated()]);

        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json($user);
    }

    /**
     * Remove the specified user from storage.
     *
     * @subgroup Gestion
     *
     * @urlParam user integer required L'ID de l'utilisateur à supprimer. Example: 4
     *
     * @response status=204
     */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $user->delete();

        return response()->json(null, 204);
    }
}
