<?php

namespace Database\Seeders;

use App\Models\Matiere;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'nom' => 'Admin',
            'prenom' => 'ScolarWatch',
            'username' => 'admin',
            'email' => 'admin@scolarwatch.test',
            'telephone' => '+212600000001',
            'adresse' => 'Avenue Hassan II, Rabat',
            'role' => 'admin',
            'is_active' => true,
            'email_verified_at' => now(),
            'password' => 'password',
        ]);

        User::create([
            'nom' => 'Direction',
            'prenom' => 'ScolarWatch',
            'username' => 'direction',
            'email' => 'direction@scolarwatch.test',
            'telephone' => '+212600000002',
            'adresse' => 'Avenue Hassan II, Rabat',
            'role' => 'direction',
            'is_active' => true,
            'email_verified_at' => now(),
            'password' => 'password',
        ]);

        User::create([
            'nom' => 'Direction',
            'prenom' => 'Adjoint',
            'username' => 'direction2',
            'email' => 'direction2@scolarwatch.test',
            'telephone' => '+212600000003',
            'adresse' => 'Avenue Hassan II, Rabat',
            'role' => 'direction',
            'is_active' => true,
            'email_verified_at' => now(),
            'password' => 'password',
        ]);

        $matieres = Matiere::query()->orderBy('id_matiere')->pluck('id_matiere');

        foreach ($matieres as $index => $idMatiere) {
            $numero = $index + 1;

            User::create([
                'nom' => DemoData::noms()[$index % count(DemoData::noms())],
                'prenom' => DemoData::prenoms()[($index * 5) % count(DemoData::prenoms())],
                'username' => 'enseignant'.$numero,
                'email' => 'enseignant'.$numero.'@scolarwatch.test',
                'telephone' => '+2126000000'.str_pad((string) (10 + $numero), 2, '0', STR_PAD_LEFT),
                'adresse' => 'Quartier Agdal, Rabat',
                'role' => 'enseignant',
                'is_active' => true,
                'id_matiere' => $idMatiere,
                'email_verified_at' => now(),
                'password' => 'password',
            ]);
        }

        User::create([
            'nom' => 'Bennis',
            'prenom' => 'Mourad',
            'username' => 'enseignant11',
            'email' => 'enseignant11@scolarwatch.test',
            'telephone' => '+212600000021',
            'adresse' => 'Quartier Agdal, Rabat',
            'role' => 'enseignant',
            'is_active' => true,
            'id_matiere' => null,
            'email_verified_at' => now(),
            'password' => 'password',
        ]);

        $prenoms = DemoData::prenoms();
        $noms = DemoData::noms();

        for ($i = 1; $i <= 20; $i++) {
            User::create([
                'nom' => $noms[($i * 5) % count($noms)],
                'prenom' => $prenoms[($i * 7) % count($prenoms)],
                'username' => 'parent'.$i,
                'email' => 'parent'.$i.'@scolarwatch.test',
                'telephone' => '+2126000000'.str_pad((string) (30 + $i), 2, '0', STR_PAD_LEFT),
                'adresse' => 'Hay Riad, Rabat',
                'role' => 'parent',
                'is_active' => true,
                'email_verified_at' => now(),
                'password' => 'password',
            ]);
        }
    }
}
