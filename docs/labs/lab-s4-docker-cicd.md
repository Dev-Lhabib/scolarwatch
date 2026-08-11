# Lab Sprint 4 (Docker & CI/CD) — Pipeline de livraison continue

## Objet du sprint

Conteneuriser l'application en production et mettre en place la chaîne CI/CD :
build Docker multi-stage, image Nginx de reverse-proxy, stack de production
`docker-compose.prod.yml`, CI automatisée (tests + style), et CD poussant des
images immuables vers GHCR. La livraison sur un serveur réel (AWS EC2) est
explicitement différée — voir la section « Différé (Phase 2) » ci-dessous.

## Réalisé et validé

1. **Dockerfile multi-stage** (`Dockerfile`) — 3 étages :
   - `composer` : dépendances PHP production (`--no-dev`, autoload optimisé)
   - `node` : build Vite + Wayfinder, réutilise le vendor du stage composer
     (`@laravel/vite-plugin-wayfinder` exécute `php artisan wayfinder:generate`
     pendant `vite build`)
   - `runtime` : image minimale `php:8.4-fpm-alpine`, non-root (`app` uid 1000),
     extensions pdo_mysql/redis/intl/opcache/pcntl/zip, OPcache production
     (validate_timestamps=0), healthcheck FastCGI sur :9000.
2. **Image Nginx** (`docker/nginx.Dockerfile` + `docker/nginx/prod.conf`) —
   reverse-proxy immutable : les assets publics sont recopiés depuis l'image
   app construite dans le même run (pas de volume partagé, pas de build obsolète).
   Config durcie : `server_tokens off`, en-têtes de sécurité, gzip, cache
   immutable sur `/build/`, refus des dotfiles (`.env`, `.git`…) et des chemins
   sensibles, bloc ACME (`/.well-known/`) déjà ouvert pour la future étape TLS.
3. **Stack de production** (`docker-compose.prod.yml`) — `app` (php-fpm),
   `queue` (worker Redis, healthcheck par liveness du process), `nginx`
   (seul port publié, `APP_PORT` défaut 8080), `mysql:8.0` et `redis:7-alpine`,
   chacun avec healthcheck ; volumes nommés persistants ; variables MySQL
   obligatoires (`${VAR:?}` fail-fast). `.env.production.example` est la source
   de vérité documentée (clé APP_KEY fournie au runtime, jamais dans l'image).
4. **CI** (`.github/workflows/ci.yml`) — sur chaque push/PR : suite Pest complète
   (PHP 8.4, Node 22, SQLite en mémoire, `QUEUE_CONNECTION=sync`) + `pint --test`.
   Statut : vert.
5. **CD** (`.github/workflows/cd.yml`) — sur tags `v*` (et `workflow_dispatch`) :
   attend que CI passe, puis build/push des images `app-*` et `nginx-*` vers
   `ghcr.io/dev-lhabib/scolarwatch` avec trois types de tags par image :
   semver (`app-vX.Y.Z`), immuable par commit (`app-<short-sha>`, cible de
   rollback) et flottant (`app-latest`). Versions publiées à ce jour :
   `v1.0.0`, `v1.1.0`, `v1.2.0`, `v1.2.1`, `v1.3.0`.
6. **`scribe.php` boot-safe** (PR #17, `d7944ee`) — la config Scribe ne casse
   plus le boot quand les dépendances de dev sont absentes (nécessaire pour le
   build de production, où `--no-dev` exclut scribe).
7. **Durcissement `APP_KEY` dans l'image** (PR #18, `d4d6da6`) — correction du
   lint `SecretsUsedInArgOrEnv` : l'`ENV APP_KEY` codée en dur est supprimée du
   Dockerfile. Le build génère désormais une clé jetable par `key:generate --show`
   (uniquement pour le boot `package:discover` / `wayfinder:generate`), et la
   vraie clé est fournie au runtime via le `env_file` de `docker-compose.prod.yml`.
   Vérifié : build vert, l'image finale ne contient aucun `APP_KEY` figé, et
   `config:cache` réussit avec la clé du runtime.

## Différé (Phase 2) — déploiement live sur AWS EC2

Les tâches suivantes **ne sont pas abandonnées** mais reportées explicitement à
un sprint ultérieur, en attente de la mise à disposition du compte/des
identifiants AWS. Elles seront traitées comme un epic dédié du prochain sprint :

- Provisionnement de l'hôte EC2 (AMI, groupe de sécurité, stockage)
- Étape de déploiement SSH dans `.github/workflows/cd.yml`
- SSL/Certbot (le bloc ACME de `docker/nginx/prod.conf` est déjà préparé)
- Fichier `.env` de production sur un hôte réel (valeurs/coffre-fort secrets)
- Secrets AWS dans GitHub Actions
- CD de bout en bout vers un serveur réel (vérification en prod)

Ce report est déjà documenté dans le code pour rester cohérent :

- `.github/workflows/cd.yml:20` — « SSH deployment to the EC2 host is
  intentionally NOT implemented yet (Phase 2). »
- `README.md:183` — « SSH deployment to the AWS EC2 host is the next step
  (Phase 2). »

## Résultat

Phase 1 du sprint 4 (build + CI/CD vers GHCR) **terminée et validée** : images
immuables publiées et consommables par `docker-compose.prod.yml`, rollback par
tag, suite de tests verte. Phase 2 (déploiement réel AWS) **déplacée au
sprint 5** en attente des accès AWS — non traitée, non supposée livrée.
