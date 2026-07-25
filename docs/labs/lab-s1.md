# Lab Sprint 1 — Vérification Postman

Collection : `docs/postman/ScolarWatch.postman_collection.json`

## Parcours testé

1. **Login (email)** → `POST /api/login` avec `admin@scolarwatch.test` — 200, retourne `user` + `token`
2. **Login (username)** → `POST /api/login` avec `admin` — 200, même comportement
3. **Login échoué** → mauvais mot de passe — 422, message "Identifiants incorrects."
4. **Logout** → `POST /api/logout` avec token — 200, token révoqué (vérifié : requête suivante avec le même token → 401)
5. **Création de compte (admin)** → `POST /api/users` avec token admin — 201, `cree_par` renseigné automatiquement
6. **Création de compte sans token** → 401 "Unauthenticated."
7. **Matières CRUD** :
   - `GET /api/matieres` (avec/sans token) — 200 / 401
   - `POST /api/matieres` (admin) — 201 ; champs manquants — 422
   - `GET /api/matieres/{id}` — 200
   - `PUT /api/matieres/{id}` — 200
   - `DELETE /api/matieres/{id}` (admin) — 204 ; non-admin — 403

## Résultat

Tous les cas ci-dessus ont été vérifiés manuellement via Postman/curl et sont couverts par des tests automatisés Pest (`tests/Feature/AuthApiTest.php`, `tests/Feature/MatiereApiTest.php`, `tests/Feature/PolicyTest.php`) — 27 tests, 68 assertions, tous verts.
