<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', User::class);

        return response()->json(User::all());
    }

    /**
     * Store a newly created user in storage.
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
     */
    public function show(User $user)
    {
        $this->authorize('view', $user);

        return response()->json($user);
    }

    /**
     * Display a listing of soft-deleted (archived) users.
     */
    public function archived()
    {
        $this->authorize('viewAny', User::class);

        return response()->json(User::onlyTrashed()->get());
    }

    /**
     * Restore a soft-deleted (archived) user.
     */
    public function restore(User $user)
    {
        $this->authorize('restore', $user);

        $user->restore();

        return response()->json($user);
    }

    /**
     * Permanently delete a soft-deleted (archived) user.
     */
    public function forceDelete(User $user)
    {
        $this->authorize('forceDelete', $user);

        $user->forceDelete();

        return response()->json(null, 204);
    }

    /**
     * Archive (soft-delete) multiple users in one request.
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
     */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $user->delete();

        return response()->json(null, 204);
    }
}
