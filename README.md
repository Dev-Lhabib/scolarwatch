# ScolarWatch

ScolarWatch is an AI-powered school management system built with Laravel 13, React, and Inertia.js. It helps schools manage students, classes, attendance, grades, and teacher observations while providing intelligent insights to identify students at risk of academic difficulties (décrochage scolaire).

The application combines a modern web architecture with artificial intelligence to automate educational monitoring and improve communication between administrators, teachers, direction staff, and parents.

## Features

- 🔐 Secure authentication with Laravel Sanctum
- 👥 Multi-role user management (Administrator, Teacher, Direction, Parent)
- 🏫 Class and student management, with teacher-to-class and professeur principal assignment
- 🗂️ Archive, restore and permanently delete users, students and classes (individually or in bulk)
- 👥 Bulk-assign students to a class
- 📅 Attendance and lateness tracking
- 📝 Grade and teacher remark management
- 🤖 AI-generated student risk summaries using Groq and Laravel AI, with human-in-the-loop correction and validation
- 📊 School analytics and reporting
- 🚦 API health endpoint (`/api/health`) with database and Redis checks
- 🐳 Docker-based development environment
- ⚙️ CI/CD with GitHub Actions (Sprint 4 deliverable)
- ☁️ Target deployment platform: AWS EC2

## Tech Stack

### Backend
- Laravel 13
- PHP 8.4
- Laravel Sanctum
- Laravel AI (Groq provider, openai/gpt-oss-120b)
- MySQL 8
- Redis 7

### Frontend
- React
- Inertia.js
- Vite

### DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD — Sprint 4 deliverable)
- GitHub Container Registry (GHCR)
- AWS EC2 (Ubuntu) — target

## Getting Started

### Prerequisites
- Docker & Docker Compose (or PHP 8.4 + Composer + Node.js on the host)

### Installation

```bash
git clone git@github.com:Dev-Lhabib/scolarwatch.git
cd scolarwatch
cp .env.example .env

docker compose up -d
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
```

The `docker compose up -d` command starts the application, queue worker, MySQL, Redis, and phpMyAdmin.

### Frontend

```bash
npm install
npm run dev     # for development with hot reload
npm run build   # for a production build
```

### Access

| Service     | URL                          |
|-------------|------------------------------|
| Application | http://localhost:8000        |
| phpMyAdmin  | http://localhost:8080        |
| API health  | http://localhost:8000/api/health |

### Seeded accounts

After `php artisan migrate --seed`, the following accounts are available (password: `password`):

| Role          | Username      | Email                           |
|---------------|---------------|---------------------------------|
| Administrator | `admin`       | `admin@scolarwatch.test`        |
| Direction     | `direction`   | `direction@scolarwatch.test`    |
| Teacher       | `enseignant1` | `enseignant1@scolarwatch.test`  |
| Parent        | `parent1`     | `parent1@scolarwatch.test`      |

The AI agent requires a Groq API key: set `GROQ_API_KEY` in `.env`.

## Testing

```bash
docker compose exec app php artisan test --compact
```

The suite covers authentication, policies, CRUD endpoints, the AI synthesis flow, notifications, and the archive/bulk administration features.

## API

The API is a pure REST API served from `routes/api.php`, secured by Sanctum. A ready-to-use Postman collection is available at `docs/postman/ScolarWatch.postman_collection.json`.

Key endpoints:
- `POST /api/login` — authentication (email or username, rate-limited)
- `GET /api/health` — database and Redis status checks
- `/api/users`, `/api/eleves`, `/api/classes` — CRUD plus archive, restore, and force-delete endpoints
- `POST /api/eleves/bulk-assign-class` — assign multiple students to a class in one operation

## Documentation

- `docs/cahier-des-charges.md` — functional specification
- `docs/mcd.md`, `docs/mld.md` — conceptual and logical data models
- `docs/diagrams/` — MCD, MLD, and architecture diagrams
- `docs/labs/` — per-sprint lab reports
- `docs/postman/` — Postman collection

## Architecture

The application follows a modern layered architecture:

- React + Inertia.js for the user interface
- Laravel REST API and web routes
- MySQL for relational data
- Redis for queues and caching
- Groq LLM integration for AI-powered student risk analysis
- Automated CI/CD pipeline with Docker and GitHub Actions

## Project Status

🚧 Work in Progress

This repository is actively developed as part of a backend development bootcamp project (Simplon Maghreb — Projet Fil Rouge). New features are implemented incrementally following Scrum sprints.
