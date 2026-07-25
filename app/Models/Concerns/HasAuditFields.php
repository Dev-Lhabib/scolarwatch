<?php

namespace App\Models\Concerns;

trait HasAuditFields
{
    /**
     * Boot the trait and register the saving hook.
     */
    protected static function bootHasAuditFields(): void
    {
        static::saving(function ($model) {
            if (! auth()->check()) {
                return;
            }

            if (! $model->exists) {
                $model->cree_par = auth()->id();
            }

            $model->updated_by = auth()->id();
        });
    }
}
