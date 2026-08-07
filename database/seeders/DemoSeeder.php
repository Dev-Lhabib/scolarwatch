<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the complete, deterministic demo dataset for ScolarWatch.
     *
     * Designed to be run after `php artisan migrate:fresh` so ids and
     * relationships stay stable across runs.
     */
    public function run(): void
    {
        $this->call([
            MatiereSeeder::class,
            UserSeeder::class,
            ClasseSeeder::class,
            TeacherSeeder::class,
            EleveSeeder::class,
            ParentSeeder::class,
            NoteSeeder::class,
            AbsenceSeeder::class,
            RetardSeeder::class,
            RemarqueSeeder::class,
            SyntheseSeeder::class,
            NotificationSeeder::class,
            ArchiveSeeder::class,
        ]);

        $this->command?->info('DemoSeeder terminé : jeu de données déterministe et archivable généré.');
    }
}
