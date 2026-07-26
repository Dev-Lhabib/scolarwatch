# Lab Sprint 2 (CRUD) — Vérification Postman

Collection : `docs/postman/ScolarWatch.postman_collection.json` (dossiers Classes, Eleves, Notes, Absences, Retards, Remarques ajoutés)

## Parcours testé

- **Classes** : CRUD complet (admin), assignation professeur principal, assignation enseignant via `enseigne`, accès restreint au professeur principal pour sa propre classe
- **Eleves** : création avec attachement de tuteurs, mise à jour avec remplacement des tuteurs (`sync`), accès restreint (professeur principal de la classe, parent tuteur uniquement)
- **Notes** : double vérification enseignant (classe ET matière), admin/direction accès complet
- **Absences / Retards / Remarques** : accès enseignant limité à leur classe (via `enseigne` ou professeur principal), parent limité à leurs enfants

## Résultat

Couverture automatisée : `ClasseApiTest`, `EleveApiTest`, `NoteApiTest`, `AbsenceApiTest`, `RetardApiTest`, `RemarqueApiTest` — 77 tests, 187 assertions, tous verts.
