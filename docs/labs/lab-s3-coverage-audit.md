# Lab Sprint 3 (Tests) — Audit de couverture de tests

## 1. Pourquoi `php artisan test --coverage` n'a pas pu être exécuté

Aucun driver de couverture n'est disponible dans l'environnement de développement.

Commande exécutée :

```bash
php artisan test --coverage
```

Erreur renvoyée :

```
ERROR  Code coverage driver not available. Did you install Xdebug or PCOV?
```

Diagnostic de l'environnement :

- Extension PHP `xdebug` : absente (`/etc/php/8.5/cli/conf.d` ne contient aucun ini xdebug/pcov)
- Extension PHP `pcov` : absente
- `phpdbg` : introuvable
- Outillage de compilation (`phpize`, `gcc`, `pecl`) : indisponible → impossible de compiler `pcov` localement
- `sudo` non interactif : refusé → impossible d'installer `php-xdebug` (pourtant disponible via `apt`, v3.5.0)

**Conséquence : le pourcentage de couverture global n'a pas pu être mesuré dans l'environnement actuel. Ce document ne contient aucun chiffre de couverture inventé.**

## 2. Méthodologie : audit statique

À défaut de driver de couverture, l'audit a été réalisé par lecture croisée statique de :

1. `routes/api.php` — liste exhaustive des endpoints (groupe `auth:sanctum` + endpoints publics)
2. `app/Http/Controllers/**` — méthodes publiques de chaque contrôleur
3. `tests/Feature/**` (30 fichiers + 1 unitaire, **163 tests / 577 assertions** Pest, tous avec `RefreshDatabase`) — endpoints et méthodes effectivement exercés
4. `resources/js/pages/**` + `routes/web.php` — rendus Inertia vs tests de pages (`assertInertia`)

## 3. Points forts de la couverture existante

| Domaine | Couverture |
|---|---|
| Authentification (`login` email + username, `logout`) | ✅ AuthApiTest |
| CRUD Utilisateurs (+ protections admin bootstrap) | ✅ UserApiTest, UserBootstrapAdminProtectionTest |
| CRUD Matières | ✅ MatiereApiTest |
| CRUD Classes + affectations (`assignProfesseurPrincipal`, `assignEnseignant`) | ✅ ClasseApiTest |
| CRUD Élèves (+ attachement des tuteurs) | ✅ EleveApiTest |
| Suivi pédagogique : `store` / `show` Notes/Absences/Retards/Remarques | ✅ (403 hors classe, 403 mauvaise matière pour NotePolicy) |
| Notifications (`index`, `marquerCommeLue`) | ✅ NotificationApiTest |
| Enfants d'un parent | ✅ ParentChildrenTest |
| Brique IA : déclenchement, job `GenererSyntheseIA` (succès/échec via `GhostwriterAgent::fake()`), correction du niveau d'alerte, envoi → `DecrochageAlertNotification` | ✅ SyntheseIAApiTest, GenererSyntheseIATest, SyntheseIACorrectionTest, SyntheseIAEnvoyerTest |
| Pages Inertia (12 fichiers de tests de pages) | ✅ 19 assertions `assertInertia` |

## 4. Endpoints entièrement couverts

Auth (login, logout), Users (index, store, show, update, delete), Matières (index, store, show, update, delete), Classes (index, store, show, delete, assignProfesseurPrincipal, assignEnseignant), Élèves (index, store, show, update, delete), Notes/Absences/Retards/Remarques (store, show), Notifications (index, marquerCommeLue), Parent (children), Synthèses IA (store, show, corrigerNiveauAlerte, envoyer).

## 5. Endpoints partiellement couverts

| Endpoint | Manque |
|---|---|
| `GET /api/notes` | seul le cas **401** est testé — pas de 200 authentifié |
| `GET /api/absences` | idem |
| `GET /api/retards` | idem |
| `GET /api/remarques` | idem |

## 6. Endpoints sans couverture (10)

| Endpoint | Contrôleur | Sprint d'origine |
|---|---|---|
| `GET /api/user` | closure `routes/api.php` | Sprint 1 (baseline auth) |
| `GET /api/health` | closure (public) | Sprint 1 (task #12) |
| `PUT/PATCH /api/classes/{classe}` | `ClasseController@update` | Sprint 2 (tasks #2/#3) |
| `PUT/PATCH /api/notes/{note}` | `NoteController@update` | Sprint 2 (E3, tasks #6/#7) |
| `DELETE /api/notes/{note}` | `NoteController@destroy` | Sprint 2 (E3) |
| `PUT/PATCH /api/absences/{absence}` | `AbsenceController@update` | Sprint 2 (E3) |
| `DELETE /api/absences/{absence}` | `AbsenceController@destroy` | Sprint 2 (E3) |
| `PUT/PATCH /api/retards/{retard}` | `RetardController@update` | Sprint 2 (E3) |
| `DELETE /api/retards/{retard}` | `RetardController@destroy` | Sprint 2 (E3) |
| `PUT/PATCH /api/remarques/{remarque}` | `RemarqueController@update` | Sprint 2 (E3) |
| `DELETE /api/remarques/{remarque}` | `RemarqueController@destroy` | Sprint 2 (E3) |

## 7. Lacunes restantes, groupées par sprint/feature

### Sprint 2 — Suivi pédagogique (E3)
- `update` + `destroy` manquants pour Notes, Absences, Retards, Remarques (8 endpoints)
- Par voie de conséquence, les branches `update`/`delete` des policies `NotePolicy`, `AbsencePolicy`, `RetardPolicy`, `RemarquePolicy` ne sont **jamais atteintes**
- Cas 200 des `index` de ces 4 ressources non testés
- `ClasseController@update` non testé

### Sprint 1 — Auth baseline
- `GET /api/user` (profil courant) et `GET /api/health` non testés

### Sprint 3 — Frontend Inertia (E6)
- Page `auth/login` : aucun test Inertia
- Page `dashboard/statistiques` (direction) : aucun test Inertia
- `welcome` : simple smoke 200 (`assertOk`), pas d'assertion de composant

### Tests croisés d'autorisation (E7, task #23)
- `PolicyTest` n'exerce directement que `ElevePolicy` et `ClassePolicy`
- `viewAny` des policies jamais asserté directement ; `UserPolicy`, `NotePolicy`, `AbsencePolicy`, `RetardPolicy`, `RemarquePolicy`, `NotificationPolicy`, `SyntheseIAPolicy` ne sont exercées qu'indirectement via les tests API

### Code non testé directement
- `app/Models/Concerns/HasAuditFields` (couvert indirectement via les colonnes `cree_par`/`updated_by`)
- `app/Ai/Schemas/SyntheseRisqueSchema` (interne à `GhostwriterAgent`)
- Les 10 form requests (`LoginRequest`, `StoreUserRequest`, `UpdateUserRequest`, `StoreMatiereRequest`, `StoreClasseRequest`, `StoreEleveRequest`, `StoreNoteRequest`, `StoreAbsenceRequest`, `StoreRetardRequest`, `StoreRemarqueRequest`) — exercées indirectement (les 422 prouvent la validation), aucune assertion directe sur les règles
- `app/Http/Middleware/HandleInertiaRequests.php` — exercé par chaque test de page Inertia

## 8. Recommandations

1. **Task 23** : compléter les tests croisés d'autorisation (parent hors périmètre, enseignant hors de sa classe sur Absence/Remarque, professeur principal d'une autre classe sur SyntheseIA) — ces cas sont **déjà couverts** par les tests existants (403 vérifiés partout) ; se concentrer sur les branches effectivement manquantes (sections 5-7).
2. Priorité aux 10 endpoints sans test (Sprint 2) pour la couverture fonctionnelle : `update`/`delete` du suivi + `update` classe.
3. Ajouter les cas 200 des `index` Notes/Absences/Retards/Remarques.
4. Ajouter les 2 tests de pages Inertia manquants (`auth/login`, `dashboard/statistiques`).
5. Pour mesurer un pourcentage réel : installer `php-xdebug` ou `php-pcov` sur l'environnement de dev, puis relancer `php artisan test --coverage`.
