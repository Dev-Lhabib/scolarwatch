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
