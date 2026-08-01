# Rapport d'infrastructure — ScolarWatch

Date : 31/07/2026
Branche : `feature/s3-frontend`

## Résumé

Débogage complet de l'infrastructure locale (Docker + WSL) et rétablissement d'un
environnement de développement stable. Tous les services sont fonctionnels :
MySQL, Redis, `scolarwatch_app`, `scolarwatch_queue` (voir limitation ci-dessous).

## Causes racines identifiées et corrections

### 1. HTTP 500 sur `/login` + latence de login de ~43s

- **Cause** : `.env` pointait sur `DB_HOST=mysql`, un hôte résolvable uniquement
  dans le réseau Docker interne. Depuis WSL, chaque résolution DNS échoue en
  ~20,5s ; deux tentatives (~43,8s) avant de tomber en erreur → 500 sur `/login`.
- **Correction** : `.env` modifié pour l'environnement natif :
  - `DB_HOST=127.0.0.1`
  - `REDIS_HOST=127.0.0.1`
- **Résultat** : `/login` répond en ~1,1s, `/api/health` 200.

### 2. Docker Desktop dégradé

- **Symptômes** : `docker version` en panic Go, ports publiés qui acceptent puis
  reset les connexions.
- **Correction** : restart propre de Docker Desktop + `wsl --shutdown`.
- **Résultat** : `scolarwatch_app` et `mysql` sains.

### 3. Contexte Docker inutilisable depuis WSL

- **Problème** : le contexte actif `desktop-linux` expose son endpoint sous forme
  de pipe Windows (`npipe:////./pipe/dockerDesktopLinuxEngine`), inutilisable
  depuis Linux → `docker ps` échoue avec `protocol not available`.
- **Workaround** : `docker --context default ps`.
- **À faire** : traitement définitif lors du sprint Docker dédié.

### 4. Conteneur `scolarwatch_queue` en boucle de Restarting

- **Cause** : le conteneur ne voit pas la base (`.env` `DB_HOST=127.0.0.1`
  inatteignable depuis l'intérieur du conteneur).
- **Correctif prévu (sprint Docker)** : override `environment: DB_HOST: mysql`
  dans `docker-compose.yml` pour les services en conteneur.

### 5. Postman : 404 sur `/api/...`

- **Cause** : double slash `//api/` dans l'URL + GET envoyé sur une route
  exclusivement POST (`POST /api/login`).
- **Statut** : résolu, n'est plus à corriger.

## Environnement de développement validé

- Laravel : `php artisan serve` → **http://127.0.0.1:8001**
- Vite : `npm run dev` → port 5173
- Base Postman : **http://127.0.0.1:8001/api/...**
- MySQL : 8.0.46 sain (21 tables, via `php artisan db:show`)
- Redis : `PONG`
- `GET /api/health` : 200 sur 8000 (Docker) et 8001 (natif)
- Authentification API : Sanctum, header `Authorization: Bearer <token>` ;
  seule `POST /api/login` est publique (`throttle:6,1`).

## Configuration courante pertinente (`.env`)

- `DB_HOST=127.0.0.1`, `REDIS_HOST=127.0.0.1`
- `SESSION_DRIVER=database`, `CACHE_STORE=redis`, `QUEUE_CONNECTION=redis`
- `APP_URL=http://localhost:8000`

## Notes de travail

- Depuis Windows, PowerShell altère `&`, `!` et `\` : exécuter via
  `wsl bash -c '...'`.
- Nombre de tests PHP : 117 (Task A) avant ce chantier.
- Sprint Docker (hors périmètre ici) : résoudre le contexte `desktop-linux`,
  l'override `DB_HOST` du queue, et re-tester la stack entièrement conteneurisée.
