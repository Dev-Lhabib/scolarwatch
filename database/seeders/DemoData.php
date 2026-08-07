<?php

namespace Database\Seeders;

use RuntimeException;

/**
 * Deterministic reference data shared by the demo seeders.
 *
 * Every value exposed here is stable across runs so that `db:seed` always
 * produces the exact same dataset, regardless of Faker state or system clock.
 */
final class DemoData
{
    private function __construct()
    {
    }

    /**
     * The ten matieres of the demo establishment.
     *
     * @return array<int, array{nom: string, code: string}>
     */
    public static function matieres(): array
    {
        return [
            ['nom' => 'Mathématiques', 'code' => 'MATH'],
            ['nom' => 'Physique-Chimie', 'code' => 'PC'],
            ['nom' => 'Français', 'code' => 'FR'],
            ['nom' => 'Anglais', 'code' => 'ANG'],
            ['nom' => 'Arabe', 'code' => 'AR'],
            ['nom' => 'Histoire-Géographie', 'code' => 'HG'],
            ['nom' => 'SVT', 'code' => 'SVT'],
            ['nom' => 'Informatique', 'code' => 'INFO'],
            ['nom' => 'Philosophie', 'code' => 'PHILO'],
            ['nom' => 'Éducation Physique', 'code' => 'EPS'],
        ];
    }

    /**
     * The twelve classes. The last two belong to the previous school year and
     * are archived by ArchiveSeeder.
     *
     * @return array<int, array{nom: string, niveau: string, annee_scolaire: string, capacite: int}>
     */
    public static function classes(): array
    {
        $annee = '2025-2026';
        $ancienne = '2024-2025';

        return [
            ['nom' => '1AC-A', 'niveau' => '1AC', 'annee_scolaire' => $annee, 'capacite' => 30],
            ['nom' => '1AC-B', 'niveau' => '1AC', 'annee_scolaire' => $annee, 'capacite' => 30],
            ['nom' => '2AC-A', 'niveau' => '2AC', 'annee_scolaire' => $annee, 'capacite' => 30],
            ['nom' => '2AC-B', 'niveau' => '2AC', 'annee_scolaire' => $annee, 'capacite' => 30],
            ['nom' => '3AC-A', 'niveau' => '3AC', 'annee_scolaire' => $annee, 'capacite' => 30],
            ['nom' => '3AC-B', 'niveau' => '3AC', 'annee_scolaire' => $annee, 'capacite' => 30],
            ['nom' => 'TC-A', 'niveau' => 'TC', 'annee_scolaire' => $annee, 'capacite' => 30],
            ['nom' => 'TC-B', 'niveau' => 'TC', 'annee_scolaire' => $annee, 'capacite' => 30],
            ['nom' => '1BAC-SC-A', 'niveau' => '1BAC', 'annee_scolaire' => $annee, 'capacite' => 30],
            ['nom' => '2BAC-PC-A', 'niveau' => '2BAC', 'annee_scolaire' => $annee, 'capacite' => 30],
            ['nom' => '1AC-C', 'niveau' => '1AC', 'annee_scolaire' => $ancienne, 'capacite' => 30],
            ['nom' => '2AC-C', 'niveau' => '2AC', 'annee_scolaire' => $ancienne, 'capacite' => 30],
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function prenoms(): array
    {
        return [
            'Yassine', 'Sara', 'Omar', 'Imane', 'Mehdi', 'Salma', 'Hamza', 'Khadija',
            'Ayoub', 'Zineb', 'Anas', 'Fatima-Zahra', 'Rayan', 'Lina', 'Adam', 'Nour',
            'Ilyas', 'Meryem', 'Bilal', 'Houda', 'Youssef', 'Aya', 'Karim', 'Hiba',
            'Adil', 'Rim', 'Soufiane', 'Asmae', 'Tarek', 'Ghita',
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function noms(): array
    {
        return [
            'El Amrani', 'Benali', 'Idrissi', 'Bouzidi', 'Alaoui', 'El Fassi', 'Berrada',
            'Chraibi', 'Ouazzani', 'Tazi', 'Amrani', 'Kabbaj', 'Sekkat', 'Ziani',
            'Fadel', 'Bennis', 'El Khattabi', 'Lahlou', 'Cheikh', 'Marrakchi',
            'Saidi', 'El Bouhali', 'Mansouri', 'Belkacemi',
        ];
    }

    /**
     * The five academic profiles are distributed over a ten-entry pattern so
     * the demo contains mostly average pupils with a realistic tail.
     *
     * @return array<int, string>
     */
    public static function profilePattern(): array
    {
        return [
            'bonne', 'bonne', 'moyen', 'moyen', 'moyen',
            'bonne', 'excellent', 'moyen', 'risque', 'critique',
        ];
    }

    /**
     * Determine the academic profile of the ordinal-th seeded student.
     */
    public static function profileFor(int $ordinal): string
    {
        $pattern = self::profilePattern();

        return $pattern[($ordinal - 1) % count($pattern)];
    }

    /**
     * Notes range (min, max) in points for a given profile.
     *
     * @return array{0: int, 1: int}
     */
    public static function noteRangeFor(string $profile): array
    {
        return match ($profile) {
            'excellent' => [18, 20],
            'bonne' => [15, 17],
            'moyen' => [11, 14],
            'risque' => [8, 10],
            'critique' => [3, 7],
        };
    }

    /**
     * Number of absences per trimester for a given profile.
     */
    public static function absencesFor(string $profile): int
    {
        return match ($profile) {
            'excellent' => 0,
            'bonne' => 1,
            'moyen' => 3,
            'risque' => 8,
            'critique' => 15,
        };
    }

    /**
     * Number of retards per trimester for a given profile.
     */
    public static function retardsFor(string $profile): int
    {
        return match ($profile) {
            'excellent' => 0,
            'bonne' => 2,
            'moyen' => 5,
            'risque' => 12,
            'critique' => 12,
        };
    }

    /**
     * Number of remarques per trimester for a given profile.
     */
    public static function remarkCountFor(string $profile): int
    {
        return match ($profile) {
            'excellent' => 2,
            'bonne' => 3,
            'moyen' => 3,
            'risque' => 3,
            'critique' => 4,
        };
    }

    /**
     * The AI alert level associated with a profile.
     */
    public static function alertLevelFor(string $profile): string
    {
        return match ($profile) {
            'excellent', 'bonne' => 'faible',
            'moyen', 'risque' => 'moyen',
            'critique' => 'eleve',
        };
    }

    /**
     * Remarques templates per profile.
     *
     * @return array<int, array{categorie: string, contenu: string}>
     */
    public static function remarksFor(string $profile): array
    {
        return match ($profile) {
            'excellent' => [
                ['categorie' => 'participation', 'contenu' => 'Excellent travail en classe, participe activement et aide ses camarades.'],
                ['categorie' => 'comportement', 'contenu' => 'Comportement exemplaire et attitude très respectueuse.'],
            ],
            'bonne' => [
                ['categorie' => 'participation', 'contenu' => 'Participe régulièrement et montre un intérêt constant pour les cours.'],
                ['categorie' => 'comportement', 'contenu' => 'Bon comportement général, quelques bavardages ponctuels.'],
                ['categorie' => 'assiduite', 'contenu' => "Travail sérieux et régulier, peut encore gagner en rigueur."],
            ],
            'moyen' => [
                ['categorie' => 'participation', 'contenu' => "Participation irrégulière, hésite à s'exprimer en classe."],
                ['categorie' => 'comportement', 'contenu' => 'Comportement correct mais parfois distrait pendant les cours.'],
                ['categorie' => 'assiduite', 'contenu' => "Résultats moyens, doit consolider ses bases et s'organiser davantage."],
            ],
            'risque' => [
                ['categorie' => 'participation', 'contenu' => "Désinvestissement notable en classe, peu d'implication dans les activités."],
                ['categorie' => 'comportement', 'contenu' => 'Comportement perturbateur ponctuel qui gêne le déroulement du cours.'],
                ['categorie' => 'assiduite', 'contenu' => "Absentéisme préoccupant, manque de régularité dans le travail personnel."],
            ],
            'critique' => [
                ['categorie' => 'assiduite', 'contenu' => 'Absentéisme important mettant en péril la poursuite de sa scolarité.'],
                ['categorie' => 'comportement', 'contenu' => 'Comportement très perturbateur, incidents répétés en classe.'],
                ['categorie' => 'travail', 'contenu' => 'Résultats critiques, situation de décrochage scolaire avancée.'],
                ['categorie' => 'participation', 'contenu' => 'Totalement désinvesti des activités pédagogiques.'],
            ],
        };
    }

    /**
     * Structured synthesis content for a given profile.
     *
     * @return array{
     *     niveau_alerte: string,
     *     facteurs_risque: array<int, string>,
     *     signaux_textuels: array<int, string>,
     *     recommandations: array<int, string>,
     *     message_parent: string,
     * }
     */
    public static function synthesisFor(string $profile): array
    {
        return match ($profile) {
            'excellent' => [
                'niveau_alerte' => 'faible',
                'facteurs_risque' => [],
                'signaux_textuels' => [],
                'recommandations' => ["Poursuivre les encouragements et valoriser l'excellence."],
                'message_parent' => "Votre enfant réalise un excellent trimestre. Continuez à l'encourager.",
            ],
            'bonne' => [
                'niveau_alerte' => 'faible',
                'facteurs_risque' => [],
                'signaux_textuels' => [],
                'recommandations' => ['Maintenir le rythme de travail actuel.'],
                'message_parent' => "Votre enfant suit une progression satisfaisante. Continuez à l'accompagner.",
            ],
            'moyen' => [
                'niveau_alerte' => 'moyen',
                'facteurs_risque' => ['Moyenne générale dans la moyenne basse', 'Assiduité irrégulière'],
                'signaux_textuels' => ["Résultats moyens, doit consolider ses bases et s'organiser davantage."],
                'recommandations' => ['Entretien avec le professeur principal', 'Encadrement renforcé à la maison'],
                'message_parent' => "Risque modéré de décrochage scolaire. Un suivi rapproché est recommandé.",
            ],
            'risque' => [
                'niveau_alerte' => 'moyen',
                'facteurs_risque' => ['Absences répétées', 'Baisse des résultats', 'Désinvestissement en classe'],
                'signaux_textuels' => ["Absentéisme préoccupant, manque de régularité dans le travail personnel."],
                'recommandations' => ['Convocation des parents', 'Entretien avec le professeur principal'],
                'message_parent' => "Risque élevé de décrochage scolaire. Une rencontre avec l'établissement est nécessaire.",
            ],
            'critique' => [
                'niveau_alerte' => 'eleve',
                'facteurs_risque' => ['Absentéisme important', 'Moyenne générale très faible', 'Comportement perturbateur'],
                'signaux_textuels' => [
                    'Absentéisme important mettant en péril la poursuite de sa scolarité.',
                    'Résultats critiques, situation de décrochage scolaire avancée.',
                ],
                'recommandations' => ['Convocation urgente des parents', 'Entretien avec la direction', 'Plan de soutien personnalisé'],
                'message_parent' => "Risque élevé de décrochage scolaire. La direction vous convoque pour un entretien urgent.",
            ],
        };
    }

    /**
     * Deterministic integer in [min, max] (inclusive).
     */
    public static function between(int $min, int $max, int $seed): int
    {
        if ($min > $max) {
            throw new RuntimeException('DemoData::between() requires min <= max.');
        }

        return $min + (crc32((string) $seed) % ($max - $min + 1));
    }

    /**
     * Deterministically pick one value from a list.
     */
    public static function pick(array $values, int $seed): mixed
    {
        return $values[self::between(0, count($values) - 1, $seed)];
    }

    /**
     * Key dates of a trimester for a given school year.
     *
     * @return array{start: string, end: string, c1: string, c2: string, exam: string}
     */
    public static function trimesterDates(string $anneeScolaire, string $trimestre): array
    {
        $calendar = [
            '2025-2026|T1' => ['2025-09-15', '2025-12-20', '2025-10-06', '2025-11-17', '2025-12-08'],
            '2025-2026|T2' => ['2026-01-05', '2026-03-27', '2026-02-09', '2026-03-09', '2026-03-23'],
            '2024-2025|T1' => ['2024-09-16', '2024-12-20', '2024-10-07', '2024-11-18', '2024-12-09'],
            '2024-2025|T2' => ['2025-01-06', '2025-03-28', '2025-02-10', '2025-03-10', '2025-03-24'],
        ];

        $key = $anneeScolaire.'|'.$trimestre;

        if (! isset($calendar[$key])) {
            throw new RuntimeException("Aucun calendrier défini pour {$key}.");
        }

        [$start, $end, $c1, $c2, $exam] = $calendar[$key];

        return ['start' => $start, 'end' => $end, 'c1' => $c1, 'c2' => $c2, 'exam' => $exam];
    }

    /**
     * Total number of students seeded (active + archived).
     */
    public static function studentCount(): int
    {
        return 105;
    }

    /**
     * Index (0-based) inside DemoData::classes() for the ordinal-th student.
     */
    public static function classeForOrdinal(int $ordinal): int
    {
        if ($ordinal >= 104) {
            return 11;
        }

        if ($ordinal >= 101) {
            return 10;
        }

        return intdiv($ordinal - 1, 10);
    }

    /**
     * Birth year offset (age) for a given level.
     */
    public static function ageForNiveau(string $niveau): int
    {
        return match ($niveau) {
            '1AC' => 12,
            '2AC' => 13,
            '3AC' => 14,
            'TC' => 15,
            '1BAC' => 16,
            '2BAC' => 17,
            default => 13,
        };
    }
}
