<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\User;
use Illuminate\Database\Seeder;

class ArchiveSeeder extends Seeder
{
    /**
     * Archive (soft delete) a set of records so the archive/restore/force
     * delete interfaces can be demonstrated: 2 users, 2 classes and the 5
     * students of the archived classes.
     */
    public function run(): void
    {
        $classes = Classe::query()->whereIn('nom', ['1AC-C', '2AC-C'])->get();

        Eleve::query()
            ->whereIn('id_classe', $classes->pluck('id_classe'))
            ->get()
            ->each->delete();

        $classes->each->delete();

        User::query()
            ->whereIn('username', ['enseignant11', 'parent20'])
            ->get()
            ->each->delete();
    }
}
