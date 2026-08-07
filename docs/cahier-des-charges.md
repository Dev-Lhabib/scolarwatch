# Cahier des charges — ScolarWatch

Ce document recense les exigences fonctionnelles du projet. Chaque exigence est rattachée à son module.

---

## Module Administration

### Archivage logique

> L'administrateur peut archiver les utilisateurs, les élèves et les classes. Les éléments archivés disparaissent des listes actives mais restent conservés en base de données. Ils peuvent être restaurés ou supprimés définitivement depuis l'interface d'administration.

L'archivage logique porte exclusivement sur les trois entités suivantes : **utilisateurs**, **élèves** et **classes**. Il couvre :

- Archivage individuel
- Archivage en masse
- Restauration individuelle ou multiple
- Suppression définitive des éléments archivés

Les matières, notes, absences, retards, remarques, synthèses IA et notifications ne sont pas archivables.

### Affectation en masse d'élèves

L'administrateur peut sélectionner plusieurs élèves et les affecter en une seule action à une classe existante. Seule la classe de l'élève (`id_classe`) est mise à jour ; aucune nouvelle relation n'est créée.
