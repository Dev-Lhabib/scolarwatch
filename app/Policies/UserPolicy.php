<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return $user->role === 'admin' || $user->id === $model->id;
    }

    /**
     * Determine whether the user can create models.
     *
     * The validated request data is passed by the controller so the policy can
     * enforce that no additional administrator accounts are created.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(User $user, array $data = []): Response
    {
        if ($user->role !== 'admin') {
            return Response::deny();
        }

        if (($data['role'] ?? null) === 'admin') {
            return Response::denyWithStatus(403, "La création d'un nouvel administrateur est interdite.");
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can update the model.
     *
     * The validated request data is passed by the controller so the policy can
     * protect the bootstrap administrator from deactivation and role changes.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(User $user, User $model, array $data = []): Response
    {
        if ($user->role !== 'admin') {
            return Response::deny();
        }

        if ($model->isBootstrapAdministrator()) {
            if (array_key_exists('is_active', $data) && ! filter_var($data['is_active'], FILTER_VALIDATE_BOOL)) {
                return Response::denyWithStatus(403, 'Le compte administrateur principal doit rester actif.');
            }

            if (isset($data['role']) && $data['role'] !== $model->role) {
                return Response::denyWithStatus(403, "Le rôle de l'administrateur principal ne peut pas être modifié.");
            }
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): Response
    {
        if ($user->role !== 'admin') {
            return Response::deny();
        }

        if ($model->isBootstrapAdministrator()) {
            return Response::denyWithStatus(403, 'Le compte administrateur principal ne peut pas être supprimé.');
        }

        if ($user->id === $model->id) {
            return Response::deny();
        }

        return Response::allow();
    }
}
