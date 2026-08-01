# Lab Sprint 3 (Frontend) — Compréhension des composants

Composants et pages créés pendant le Sprint 3 (Tâches 12-17 du taskboard). Pour chaque composant : rôle, hooks React principaux, props/état clés, interaction avec le backend.

## Tâche 12 — Page de connexion (`resources/js/pages/auth/login.tsx`)

- **Rôle** : authentifier l'utilisateur par identifiant (email **ou** username) + mot de passe, puis rediriger vers le tableau de bord de son rôle.
- **Hooks** : `useState` (`identifiant`, `password`, `error`, `processing`) ; `FormEvent` sur le submit.
- **Props/état clés** : aucune prop (page autonome) ; `processing` verrouille le bouton pendant l'appel.
- **Backend** : `POST /api/login` (fetch brut, sans `apiFetch`) ; stocke `data.token` et `data.user` dans `localStorage` (`auth_token`, `auth_user`) ; redirection `window.location.href` selon `role` (admin/enseignant/direction/parent).

## Tâche 13 — Mise en page commune par rôle (`resources/js/layouts/AppLayout.tsx`)

- **Rôle** : barre de navigation commune adaptée au rôle (`NAV_LINKS` : 5 liens admin, 4 enseignant, 2 direction, 1 parent) + affichage de l'utilisateur et bouton Déconnexion.
- **Hooks** : `useEffect` (redirige vers `/login` si aucun utilisateur en `localStorage`) ; import `Link` Inertia pour la navigation.
- **Props/état clés** : prop `children: ReactNode` ; utilisateur lu via `getAuthUser()`.
- **Backend** : aucun appel direct ; `logout()` (lib/auth) purge `auth_token`/`auth_user` et redirige vers `/login`.

## Tâche 14 — Tableau de bord Administrateur (`resources/js/pages/dashboard/admin.tsx`)

- **Rôle** : vue d'ensemble chiffrée de l'établissement (classes, matières, élèves, utilisateurs, enseignants, direction) en cartes de comptage.
- **Hooks** : `useEffect` (chargement initial + garde admin) ; `useState` pour chaque compteur et `loading`.
- **Props/état clés** : aucun prop ; les compteurs sont calculés côté client (`.length` / filtre `role === 'enseignant'`).
- **Backend** : `Promise.all` sur `GET /api/classes`, `/api/matieres`, `/api/eleves`, `/api/users` via `apiFetch` ; échec → redirection `/login`.

## Tâche 15 — Tableau de bord Enseignant (4 pages + composants)

### Page principale (`resources/js/pages/dashboard/enseignant.tsx`)

- **Rôle** : 8 cartes de statistiques cliquables (classes assignées, prof principal, élèves, absences, retards+minutes, notes, remarques, moyenne) avec squelettes pendant le chargement.
- **Hooks** : `useState` (classes, élèves, absences, retards, notes, remarques, loading) ; `useEffect` avec garde rôle enseignant ; composants locaux `StatCard`/`StatSkeleton`.
- **Props/état clés** : `StatCard` reçoit `href`, `label`, `value`, `hint` ; filtre « mes classes » via `professeur_principal?.id` **ou** `enseignants[].id`.
- **Backend** : `Promise.all` sur `GET /api/classes`, `/api/eleves`, `/api/absences`, `/api/retards`, `/api/notes`, `/api/remarques`, puis jointure/filtrage côté client.

### Mes Classes (`resources/js/pages/dashboard/enseignant/classes.tsx`)

- **Rôle** : consultation en lecture seule des classes assignées avec tableau des élèves et modal « Voir » (absences, retards, notes + matière, remarques).
- **Hooks** : `useState` (+ `selectedEleve` pour la modal) ; `useEffect` de chargement.
- **Props/état clés** : aucun prop ; filtrage « mes classes » identique à la page principale ; `matiereMap` pour traduire `id_matiere`.
- **Backend** : `Promise.all` sur classes, élèves, absences, retards, remarques, notes, matières ; aucune écriture (read-only).

### Saisie (`resources/js/pages/dashboard/enseignant/saisie.tsx`)

- **Rôle** : point d'entrée des saisies : empile `NoteEntry`, `AbsenceEntry`, `RetardEntry`, `RemarqueEntry`.
- **Hooks** : `useState` (classes, élèves, matières, `refreshKey`) ; `useEffect` de chargement.
- **Props/état clés** : chaque composant reçoit `eleves`, `authUserId`, `onChanged` et `refreshKey` (synchronisation après écriture) ; `NoteEntry` reçoit en plus `matiere` (celle de l'enseignant, `user.id_matiere`).
- **Backend** : la page charge `GET /api/classes`, `/api/eleves`, `/api/matieres` ; les écritures sont déléguées aux composants enfants.

### Composants de saisie (`resources/js/components/enseignant/{NoteEntry,AbsenceEntry,RetardEntry,RemarqueEntry}.tsx`)

- **Rôle** : formulaires CRUD pour une entité (note, absence, retard, remarque) avec liste des enregistrements existants, ajout, édition et suppression.
- **Hooks** : `useState` (champs du formulaire, liste, erreurs, `editingId`, processing) ; `useEffect` pour recharger la liste (dépend de `refreshKey`).
- **Props/état clés** : `eleves` (élèves autorisés), `authUserId` (utilisateur courant), `onChanged` (remontée de changement), `refreshKey` (invalidation).
- **Backend** : `GET` (liste) + `POST` (création) + `PUT` (mise à jour) + `DELETE` sur `/api/notes|absences|retards|remarques`.

### Synthèses IA (`resources/js/pages/dashboard/enseignant/syntheses.tsx`)

- **Rôle** : liste des élèves dont l'enseignant est **professeur principal**, avec bouton « Voir la synthèse » ouvrant la modal `SyntheseEntry` (chargement à la demande).
- **Hooks** : `useState` (classes, élèves, `selectedEleve`) ; `useEffect` de chargement avec garde rôle.
- **Props/état clés** : aucun prop ; filtre strict `classe.professeur_principal?.id === authUserId` (conforme à `SyntheseIAPolicy`).
- **Backend** : `GET /api/classes` + `GET /api/eleves` ; le reste est délégué à `SyntheseEntry`.

### `SyntheseEntry` (`resources/js/components/enseignant/SyntheseEntry.tsx`)

- **Rôle** : workflow complet de la synthèse IA d'un élève pour un trimestre (T1/T2) : états `chargement|introuvable|pret|erreur`, statuts `en_attente|echoue|traite`, badges de niveau d'alerte (y compris corrigé).
- **Hooks** : `useState` (synthèse, état, erreurs, succès, trimestre, niveau corrigé, flags processing, `loadVersion`) ; `useEffect` qui charge la synthèse via `.then` (aucun `setState` synchrone dans l'effet).
- **Props/état clés** : prop `eleve: Eleve` ; « Envoyer aux parents » désactivé tant que `message_parent` est absent.
- **Backend** : `GET /api/eleves/{eleve}/synthese?trimestre=`, `POST /api/eleves/{eleve}/synthese`, `PATCH /api/syntheses/{synthese}/niveau-alerte`, `POST /api/syntheses/{synthese}/envoyer`.

## Tâche 16 — Tableau de bord Direction (`resources/js/pages/dashboard/direction.tsx`)

- **Rôle** : suivi du décrochage : 4 cartes (total classes/élèves/absences/retards) + classements « Élèves les plus concernés » (top 20) et « Classes les plus touchées ».
- **Hooks** : `useState` + `useMemo` (agrégations `eleveStats`, `classeStats` calculées côté client) ; `useEffect` avec garde rôle direction.
- **Props/état clés** : aucun prop ; classements triés par `total` décroissant.
- **Backend** : `Promise.all` sur `GET /api/classes`, `/api/eleves`, `/api/absences`, `/api/retards` ; aucune agrégation backend.

### Statistiques (`resources/js/pages/dashboard/statistiques.tsx`)

- **Rôle** : page dédiée de la direction affichant « Élèves par classe » sous forme de graphique à barres.
- **Hooks** : `useState` (classes, élèves) ; `useEffect` avec garde rôle direction.
- **Props/état clés** : aucun prop ; `chartData` construit côté client (`name`, `élèves`) ; bibliothèque **Recharts** (`BarChart`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`).
- **Backend** : `Promise.all` sur `GET /api/classes` + `GET /api/eleves` ; agrégation client-side.

## Tâche 17 — Tableau de bord Parent (`resources/js/pages/dashboard/parent.tsx`)

- **Rôle** : liste des communications reçues (titre, message, date, badges statut_envoi / lu-non lu), cartes récapitulatives (parent, enfant, classe, dernière communication, total, non lues).
- **Hooks** : `useState` (notifications, children, loading, error, `readingId`) ; `useEffect` de chargement ; handlers `marquerLue`.
- **Props/état clés** : aucun prop ; `unreadCount` et `latest` calculés côté client ; mises à jour optimistes après `marquerLue`.
- **Backend** : `GET /api/notifications` + `GET /api/parent/children` (chargement) ; `PATCH /api/notifications/{id}/lue` (marquage lu).
