# Lab Sprint 3 (Communication) — Vérification Postman

Collection : `docs/postman/ScolarWatch.postman_collection.json` (dossier "Synthese IA" étendu avec l'envoi)

## Parcours testé

1. **Envoi** — `POST /api/syntheses/{id}/envoyer` par le professeur principal ou la direction — crée une notification par tuteur, envoie l'email (`DecrochageAlertNotification`), met à jour `statut_envoi`
2. **Garde-fou : message non prêt** — tentative d'envoi alors que `message_parent` est encore `null` (synthèse `en_attente`) — 422, aucune notification créée (découvert et corrigé lors des tests manuels)
3. **Garde-fou : aucun tuteur** — élève sans tuteur associé — 422, aucune notification créée
4. **Consultation** — liste des notifications d'un parent (à ajouter en Sprint 3 frontend/API si besoin d'un endpoint dédié)

## Résultat

Couverture automatisée : `SyntheseIAEnvoyerTest` — 6 tests, 15 assertions, tous verts. Total projet : 101 tests passants.

## Bug trouvé et corrigé pendant les tests manuels

Le garde-fou `message_parent non null` n'était pas présent dans la version initiale du endpoint `envoyer()` — découvert via test manuel Postman, corrigé avec un test de régression associé.
