# Lab Sprint 2 (IA) — Vérification Postman

Collection : `docs/postman/ScolarWatch.postman_collection.json` (dossier "Synthese IA" ajouté)

## Parcours testé

1. **Déclenchement** — `POST /api/eleves/{id}/synthese` par le professeur principal ou la direction — 202, statut `en_attente`, job poussé sur la queue Redis
2. **Rejet** — un enseignant qui n'est pas professeur principal de la classe — 403
3. **Consultation** — `GET /api/eleves/{id}/synthese?trimestre=T1` — retourne le statut courant et, une fois traité, les résultats complets (niveau_alerte, facteurs_risque, signaux_textuels, recommandations, message_parent)
4. **Correction** — `PATCH /api/syntheses/{id}/niveau-alerte` par le professeur principal — met à jour uniquement `niveau_alerte_corrige`, sans jamais modifier le `niveau_alerte` original proposé par l'IA (traçabilité)
5. **Validation** — valeur hors enum pour la correction — 422

## Résultat

Couverture automatisée : `GenererSyntheseIATest` (job — succès, échec, dispatch), `SyntheseIAApiTest` (endpoints déclenchement/consultation), `SyntheseIACorrectionTest` (endpoint de correction, traçabilité). 95 tests, 221 assertions, tous verts.

## Note technique

Le modèle utilisé est `llama-3.3-70b-versatile` via le provider Groq, intégré avec `laravel/ai` (v0.10.1). La sortie structurée est définie dans `app/Ai/Schemas/SyntheseRisqueSchema.php` et consommée par `App\Ai\Agents\GhostwriterAgent`. Les tests utilisent `GhostwriterAgent::fake([...])` pour éviter tout appel réel à l'API Groq.
