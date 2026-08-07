<?php

namespace Database\Seeders;

use App\Models\Eleve;
use App\Models\User;
use Illuminate\Database\Seeder;

class ParentSeeder extends Seeder
{
    /**
     * Link every student to a parent. Parents 1-18 supervise the active
     * students; parents 19-20 supervise the archived ones.
     */
    public function run(): void
    {
        $eleves = Eleve::query()->orderBy('id_eleve')->get();
        $parents = User::query()->where('role', 'parent')->pluck('id', 'username');

        foreach ($eleves as $index => $eleve) {
            $ordinal = $index + 1;

            $parent = match (true) {
                $ordinal >= 104 => $parents->get('parent20'),
                $ordinal >= 101 => $parents->get('parent19'),
                default => $parents->get('parent'.((($ordinal - 1) % 18) + 1)),
            };

            $eleve->tuteurs()->attach($parent);
        }
    }
}
