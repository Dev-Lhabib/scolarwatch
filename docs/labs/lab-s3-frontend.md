# Lab Sprint 3 (Frontend) — Checklist QA manuelle des tableaux de bord

> **Note importante :** ce document est un **protocole de vérification manuelle (checklist QA)**, pas un rapport d'exécution. L'automatisation navigateur n'étant pas disponible dans l'environnement de développement actuel, aucune interaction navigateur n'a été exécutée ni documentée comme telle. Les sections « Résultat » et « Capture d'écran » sont à compléter après un parcours navigateur réel par un opérateur humain.

## Préconditions globales

- Environnement de dev démarré (`docker compose up -d` ou `composer run dev`) et base seedée : `php artisan migrate:fresh --seed`.
- Comptes de test (seeder) — mot de passe par défaut des factories : `password` (usage local/dév uniquement) :
  - Admin : `admin` / `admin@scolarwatch.test`
  - Direction : `direction` / `direction@scolarwatch.test`
  - Enseignants : `enseignant1`, `enseignant2`, `enseignant3` (avec `id_matiere` affecté ; `enseignant1`/`enseignant2` sont professeurs principaux de `1AC-A`/`1AC-B`)
  - Parents : `parent1` … `parent10`
- URLs de référence (routes Inertia) : `/login`, `/dashboard/admin`, `/dashboard/enseignant`, `/dashboard/enseignant/classes`, `/dashboard/enseignant/saisie`, `/dashboard/enseignant/syntheses`, `/dashboard/direction`, `/dashboard/direction/statistiques`, `/dashboard/parent`.
- Conventions d'évaluation : ✅ conforme / ❌ non conforme / ⚠️ écart mineur, à reporter dans « Résultat ».

---

## 1. Rôle Administrateur

### Objectif
Vérifier l'authentification, le tableau de bord, la navigation et les pages de gestion (Utilisateurs, Matières, Classes, Élèves) ainsi que l'affectation d'un professeur principal.

### Préconditions
- Compte `admin` disponible.
- Base seedée (données de démo présentes).

### Étapes à réaliser
1. Se connecter sur `/login` avec `admin` / `password`.
2. Vérifier la redirection vers `/dashboard/admin`.
3. Vérifier la barre de navigation : Dashboard, Utilisateurs, Classes, Matières, Élèves.
4. Vérifier les 6 cartes de comptage (Classes, Matières, Élèves, Total utilisateurs, Enseignants, Direction) cohérentes avec la base.
5. Ouvrir `/admin/users` : liste des utilisateurs ; créer un utilisateur ; modifier un utilisateur ; tenter de supprimer l'admin de bootstrap (bouton absent/désactivé).
6. Ouvrir `/dashboard/admin/matieres` : créer, modifier, supprimer une matière.
7. Ouvrir `/dashboard/admin/classes` : créer une classe (avec professeur principal), la modifier (changer le professeur principal via la liste déroulante), la supprimer.
8. Ouvrir `/dashboard/admin/eleves` : créer un élève (classe + tuteurs), modifier (sync des tuteurs), supprimer.
9. Affecter un professeur principal à une classe via le formulaire de création/édition de classe, puis vérifier que ce professeur voit la classe dans « Mes Classes ».

### Résultat attendu
- Connexion réussie, redirection correcte, navigation opérationnelle.
- Les compteurs correspondent aux données réelles.
- Les 4 CRUD (création, édition, suppression) fonctionnent avec messages de succès/erreur appropriés.
- L'admin de bootstrap ne peut ni être supprimé ni désactivé (protection backend).
- Après affectation du professeur principal, ce dernier voit la classe dans « Mes Classes ».

### Résultat
À compléter après vérification manuelle navigateur.

### Capture d'écran
Non capturée.

---

## 2. Rôle Enseignant

### Objectif
Vérifier le tableau de bord, les classes assignées, la saisie (notes, absences, retards, remarques) et le workflow de synthèse IA.

### Préconditions
- Compte `enseignant1` (professeur principal de `1AC-A`) disponible.
- Classes et élèves seedés ; `enseignant1` dispose de notes/absences/retards/remarques de démo.

### Étapes à réaliser
1. Se connecter avec `enseignant1` / `password`, vérifier la redirection vers `/dashboard/enseignant`.
2. Vérifier les 8 cartes cliquables (Classes assignées, Prof principal, Élèves, Absences, Retards + minutes, Notes, Remarques, Moyenne) et leurs liens.
3. Ouvrir `/dashboard/enseignant/classes` : vérifier la présence de `1AC-A`, du tableau des élèves (colonnes Absences/Retards) et le modal « Voir » (absences, retards, notes avec matière, remarques).
4. Ouvrir `/dashboard/enseignant/saisie` :
   - Notes : ajouter, modifier, supprimer une note (matière = celle de l'enseignant).
   - Absences : ajouter/modifier/supprimer une absence (date, justifiée, motif).
   - Retards : ajouter/modifier/supprimer un retard (minutes, justifié, motif).
   - Remarques : ajouter/modifier/supprimer une remarque (contenu, catégorie, trimestre).
   - Vérifier que les listes se rafraîchissent après chaque opération (remontée `onChanged`/`refreshKey`).
5. Ouvrir `/dashboard/enseignant/syntheses` : vérifier que seuls les élèves des classes dont l'enseignant est professeur principal sont listés.
6. Workflow synthèse IA sur un élève : T1 → « Voir la synthèse » → si aucune synthèse, « Générer la synthèse » → « Actualiser » jusqu'au statut `traite` → vérifier facteurs de risque, recommandations, message parent → corriger le niveau d'alerte → « Envoyer aux parents » (désactivé tant que `message_parent` absent) → vérifier la confirmation du nombre de tuteurs.

### Résultat attendu
- Navigation et cartes cohérentes avec les données de l'enseignant (filtrage « mes classes » via `professeur_principal` **ou** `enseignants[]`).
- Toutes les opérations CRUD de saisie aboutissent et rafraîchissent les listes.
- Le workflow synthèse respecte les états `chargement | introuvable | pret | erreur` et les statuts `en_attente | echoue | traite` ; l'envoi aux parents est bloqué sans `message_parent`.

### Résultat
À compléter après vérification manuelle navigateur.

### Capture d'écran
Non capturée.

---

## 3. Rôle Direction

### Objectif
Vérifier le tableau de bord, la page Statistiques et l'accès en lecture seule.

### Préconditions
- Compte `direction` disponible.

### Étapes à réaliser
1. Se connecter avec `direction` / `password`, vérifier la redirection vers `/dashboard/direction`.
2. Vérifier les 4 cartes (Total classes, Total élèves, Absences, Retards).
3. Vérifier le classement « Élèves les plus concernés » (top 20) et « Classes les plus touchées ».
4. Ouvrir `/dashboard/direction/statistiques` : vérifier le graphique à barres Recharts « Élèves par classe » et le rendu responsive.
5. Vérifier qu'aucun formulaire d'écriture n'est accessible (lecture seule).

### Résultat attendu
- Données cohérentes avec la base ; tableaux triés par ordre décroissant d'incidents.
- Graphique affiché sans erreur JavaScript ; page en lecture seule.

### Résultat
À compléter après vérification manuelle navigateur.

### Capture d'écran
Non capturée.

---

## 4. Rôle Parent

### Objectif
Vérifier le tableau de bord, la liste des communications et le statut lu/non lu.

### Préconditions
- Compte `parent1` disponible ; au moins une notification créée pour ce parent (générer une synthèse puis « Envoyer aux parents » côté enseignant, ou insérer une notification en base).

### Étapes à réaliser
1. Se connecter avec `parent1` / `password`, vérifier la redirection vers `/dashboard/parent`.
2. Vérifier les cartes récapitulatives : Parent, Enfant (nom + classe), Dernière communication.
3. Vérifier les compteurs Total communications et Non lues.
4. Vérifier la liste des notifications (titre, message, date, badges « Envoyée/Échec/En attente » et « Lue/Non lue »).
5. Cliquer « Marquer comme lue » sur une notification : vérifier le changement de statut sans rechargement (mise à jour optimiste) et la décrémentation du compteur « Non lues ».

### Résultat attendu
- Notifications et enfants affichés correctement ; le marquage lu met à jour immédiatement le badge et le compteur.

### Résultat
À compléter après vérification manuelle navigateur.

### Capture d'écran
Non capturée.

---

## Points d'attention transverses

- Toute session expirée/invalide doit être redirigée vers `/login` (garde client-side de chaque page via `getAuthUser()`).
- Pas de captures d'écran disponibles à ce stade : le protocole prévoit d'en insérer une par rôle si la vérification manuelle est réalisée avec des captures (`docs/labs/captures/`).
