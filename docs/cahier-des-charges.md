# Cahier des charges — ScolarWatch

Ce document recense les exigences fonctionnelles du projet. Chaque exigence est rattachée à son module.

---

1. Introduction
Ce cahier des charges définit les besoins fonctionnels et le périmètre du projet ScolarWatch. Il sert de document de référence pour la conception, le développement et l'évaluation de l'application tout au long du projet Fil Rouge. Il précise le besoin métier auquel répond l'application, sans entrer dans les choix techniques d'implémentation, qui seront traités dans les phases de conception et de développement ultérieures.
Le projet est volontairement structuré en deux niveaux : un socle — l'ensemble de fonctionnalités qui doit être fonctionnel, testé et défendable à la soutenance — et des fonctionnalités bonus, ajoutées seulement une fois le socle stable. Aucune fonctionnalité envisagée n'est abandonnée ; celles qui ne sont pas indispensables à la démonstration du cœur du projet sont simplement reportées (Annexe — Fonctionnalités bonus).

2. Présentation du projet
ScolarWatch est une plateforme destinée aux établissements scolaires (publics ou privés, contexte marocain) permettant de centraliser les données de suivi pédagogique d'un élève — notes, absences, retards, remarques des enseignants — afin d'aider l'administration, la direction et les professeurs principaux à détecter rapidement les élèves présentant un risque de décrochage scolaire, grâce à une synthèse assistée par intelligence artificielle et à une communication facilitée avec les parents.

3. Contexte
Dans de nombreux établissements scolaires marocains, les signaux annonciateurs d'un décrochage — baisse de notes, multiplication des absences ou des retards, remarques répétées d'enseignants — existent bel et bien, mais restent dispersés entre plusieurs supports (carnets de notes, feuilles de présence, échanges oraux entre enseignants). Personne n'a le temps, ni l'outil, pour les croiser et les synthétiser avant la fin du trimestre. Le professeur principal découvre souvent la situation d'un élève au moment du conseil de classe, quand il est déjà tard pour agir. Des outils existants (Massar, Taalibe, ClassDojo, PowerSchool) couvrent la gestion administrative scolaire, mais aucun ne propose une synthèse automatique et intelligible des signaux de décrochage à partir du texte libre des enseignants.

4. Problématique
Comment permettre aux établissements scolaires de détecter à temps les élèves à risque de décrochage, en synthétisant automatiquement les notes, absences, retards et remarques des enseignants, afin que l'administration, la direction et les parents puissent agir avant qu'une situation ne s'aggrave ?



5. Objectifs
Objectif général
Développer une application permettant de centraliser le suivi pédagogique des élèves et d'assister l'administration, la direction et les enseignants dans la détection précoce des situations de décrochage scolaire, grâce à l'intelligence artificielle.
Objectifs spécifiques
Centraliser les notes, absences, retards et remarques des enseignants pour chaque élève.
Permettre au professeur principal ou à la direction de déclencher une synthèse de risque de décrochage pour un élève, sur un trimestre donné.
Identifier les facteurs de risque de décrochage à partir des données du trimestre, notamment l'interprétation du texte libre des remarques.
Rédiger automatiquement un message destiné aux parents, en français.
Notifier les parents par email, après validation humaine du contenu.
Fournir à la direction une vision globale et statistique de l'établissement.

6. Public cible et rôles
L'application s'adresse aux écoles privées et publiques du Maroc. Le socle retient 4 rôles — chaque rôle supplémentaire représente des policies et des tests en plus, donc le rôle Élève est volontairement reporté en bonus (voir Annexe — Fonctionnalités bonus).
Acteur
Rôle système
Portée d'accès
Administrateur
admin
Globale — gère les utilisateurs, les classes, les matières et la configuration de l'établissement
Enseignant
enseignant
Ses classes assignées — saisit notes, absences, retards, remarques
Direction
direction
Globale, lecture seule — consulte le tableau de bord et les statistiques de l'établissement
Parent
parent
Ses enfants uniquement — consulte les communications le concernant

Précision importante — le "professeur principal" n'est pas un rôle système distinct. C'est un enseignant (role = enseignant) auquel l'administration confie la responsabilité d'une classe précise. Cette responsabilité est portée par une relation entre la classe et l'enseignant, et non par une valeur du champ role — un même enseignant peut être principal d'une ou plusieurs classes tout en restant enseignant "simple" dans d'autres. Un enseignant désigné professeur principal d'une classe hérite, pour cette classe uniquement, du droit de consulter le dossier complet des élèves, de déclencher une synthèse IA, et de valider l'envoi du message aux parents.

7. Périmètre du projet
Inclus (socle)
Authentification multi-rôles (Admin, Enseignant, Direction, Parent) — aucune auto-inscription, l'administrateur crée tous les comptes
Gestion des classes et des matières
Affectation des élèves à une classe, désignation d'un professeur principal par classe, affectation d'un enseignant à une classe pour une matière donnée
Gestion des présences (absences, retards) et des notes
Saisie de remarques pédagogiques en texte libre
Détection des élèves à risque de décrochage (synthèse IA), déclenchée manuellement par le professeur principal ou la direction
Correction humaine du niveau d'alerte proposé par l'IA avant tout envoi
Notification par email au parent, après validation humaine, et consultation de cette communication dans l'application
Tableau de bord analytique pour la direction (répartition des élèves par niveau d'alerte et par classe)
Non inclus
Conformément à la note de cadrage : on se concentre sur le suivi pédagogique et la détection du décrochage, et on exclut le reste d'un ERP scolaire complet.
Gestion financière et frais de scolarité
Gestion de la bibliothèque
Gestion des emplois du temps
Comptabilité de l'établissement
Visioconférence / cours en ligne
Application mobile native
Gestion des ressources humaines de l'établissement

8. Besoins fonctionnels
Authentification et gestion des comptes (Admin)
Créer, modifier et archiver un compte utilisateur
Restaurer ou supprimer définitivement un utilisateur archivé
Attribuer un rôle à un utilisateur
Aucune auto-inscription : l'administrateur crée tous les comptes
Structure pédagogique (Admin)
Créer / modifier / supprimer une classe et une matière
Créer, modifier et archiver une classe
Restaurer ou supprimer définitivement une classe archivée
Créer, modifier et archiver un élève
Restaurer ou supprimer définitivement un élève archivé
Affecter un ou plusieurs élèves à une classe
Désigner un enseignant comme professeur principal d'une classe
Affecter un enseignant à une classe (la matière enseignée est définie sur le profil de l'enseignant) 
Opérations en masse (Admin)
Archiver en masse des utilisateurs, des élèves ou des classes
Restaurer en masse des utilisateurs, des élèves ou des classes archivés
Supprimer définitivement en masse des utilisateurs, des élèves ou des classes archivés
Affecter plusieurs élèves à une même classe en une seule opération
Saisie du suivi (Enseignant)
Saisir une note pour un élève, dans une matière et un trimestre
Enregistrer une absence ou un retard
Saisir une remarque en texte libre sur un élève — c'est la matière première de l'IA, pas un champ annexe
Consultation du dossier élève
L'enseignant consulte le suivi des élèves de ses classes
Le professeur principal consulte le dossier complet d'un élève de sa classe
La direction consulte tout, en lecture seule
Synthèse IA de risque de décrochage (Professeur principal / Direction)
Déclencher une synthèse IA pour un élève, sur un trimestre donné
Traitement asynchrone : réponse immédiate, traitement en tâche de fond, statut visible (en_attente / traite / echoue)
Consultation et validation de la synthèse (Professeur principal)
Consulter le niveau d'alerte, les facteurs de risque identifiés et les recommandations d'action
Corriger le niveau d'alerte proposé par l'IA si nécessaire
Valider et envoyer le message généré au parent
Communication (Parent)
Recevoir par email le message concernant son enfant
Consulter dans l'application les communications le concernant
Tableau de bord (Direction)
Nombre d'élèves par niveau d'alerte
Répartition des élèves à risque par classe
Liste des élèves à risque élevé

9. Fonctionnalité IA
Données analysées
Les notes, absences, retards et surtout les remarques en texte libre saisies par les enseignants sur un trimestre, pour un élève donné.
Traitement
Une seule fonctionnalité IA, mais complète : à partir des données du trimestre, l'IA produit une synthèse structurée comprenant un niveau d'alerte, les facteurs de risque identifiés, les signaux textuels précis relevés dans les remarques, des recommandations d'action, et un message pré-rédigé pour le parent.
Pourquoi c'est irremplaçable
Un moteur de règles classique sait dire "plus de 5 absences". Il ne sait pas lire "il ne participe plus depuis le retour des vacances, semble ailleurs", écrit par trois enseignants différents sur la période, et comprendre que c'est le signal le plus important du dossier. C'est cette capacité d'interprétation du texte libre — pas le comptage de chiffres — qui justifie l'usage de l'IA plutôt qu'un simple système de seuils.
Résultats
Un niveau d'alerte (faible / moyen / élevé)
Une liste des facteurs de risque identifiés
Les signaux textuels précis ayant motivé l'alerte (traçabilité de l'interprétation IA)
Des recommandations d'action concrètes
Un message pré-rédigé destiné au parent, en français
Garde-fous obligatoires
L'IA ne décide jamais seule : le niveau d'alerte proposé reste modifiable par le professeur principal.
Le message parent n'est envoyé qu'après validation humaine — jamais automatiquement.
L'échec de génération est géré explicitement : statut echoue visible, possibilité de relancer la synthèse.
Sans cette brique IA, l'application se limiterait à un carnet de notes numérique : c'est la synthèse et l'interprétation automatique du texte libre qui apportent la valeur ajoutée réelle, en faisant gagner un temps que les professeurs principaux ne consacrent aujourd'hui pas à cette analyse.


10. User Stories
Administrateur
En tant qu'administrateur, je veux créer, modifier et archiver des comptes utilisateurs et leur attribuer un rôle, afin de contrôler qui accède à la plateforme.

En tant qu'administrateur, je veux créer et gérer les classes et les matières, afin d'organiser la structure pédagogique de l'établissement.

En tant qu'administrateur, je veux affecter les élèves à une classe, afin d'organiser le suivi pédagogique.

En tant qu'administrateur, je veux désigner un enseignant comme professeur principal d'une classe, afin qu'il puisse suivre les élèves de cette classe.

En tant qu'administrateur, je veux affecter un enseignant à une classe, afin de refléter la réalité des emplois du temps pédagogiques. (la matière est fixée sur le profil enseignant, pas par affectation — un enseignant polyvalent n'est pas géré en socle) 

Archivage et opérations en masse (Admin)
En tant qu'administrateur, je veux archiver, restaurer ou supprimer définitivement des utilisateurs, des élèves et des classes afin de conserver un historique tout en gardant les listes actives propres.

En tant qu'administrateur, je veux pouvoir effectuer ces opérations individuellement ou en masse afin de gagner du temps.

En tant qu'administrateur, je veux affecter plusieurs élèves à une même classe en une seule opération afin de simplifier la gestion des classes.

Enseignant
En tant qu'enseignant, je veux saisir une note pour un élève, dans une matière et un trimestre, afin d'assurer le suivi de ses performances.

En tant qu'enseignant, je veux enregistrer une absence ou un retard, afin de garder une trace fiable de la présence de l'élève.

En tant qu'enseignant, je veux saisir une remarque en texte libre sur un élève, afin de signaler un comportement ou une situation particulière.

En tant qu'enseignant, je veux consulter le suivi des élèves de mes classes, afin de rester informé de leur situation.



Professeur principal (enseignant désigné sur une classe)
En tant que professeur principal, je veux consulter le dossier complet d'un élève de ma classe, afin d'avoir une vue d'ensemble avant d'agir.

En tant que professeur principal, je veux lancer une synthèse IA pour un élève sur un trimestre, afin d'identifier rapidement un risque de décrochage.

En tant que professeur principal, je veux consulter le niveau d'alerte, les facteurs de risque et les recommandations, afin de comprendre les raisons de l'alerte avant d'agir.

En tant que professeur principal, je veux corriger le niveau d'alerte proposé par l'IA, afin de garder la décision finale entre les mains d'un humain.

En tant que professeur principal, je veux valider et envoyer le message généré au parent, afin de m'assurer que la communication est appropriée avant l'envoi.

Direction
En tant que membre de la direction, je veux consulter le tableau de bord de l'établissement, afin d'avoir une vision d'ensemble du nombre d'élèves à risque.

En tant que membre de la direction, je veux consulter la répartition des élèves par niveau d'alerte et par classe, afin d'identifier les tendances de décrochage à l'échelle de l'établissement.

Parent
En tant que parent, je veux recevoir par email le message concernant mon enfant, afin d'être informé sans avoir à interpréter des données brutes.

En tant que parent, je veux consulter dans l'application les communications me concernant, afin de retrouver l'historique des échanges à tout moment.

11. Exigences non fonctionnelles
L'application doit être simple et intuitive pour des enseignants peu à l'aise avec les outils numériques.
L'accès aux données doit être strictement contrôlé selon le rôle de l'utilisateur (un parent ne voit que les données de son enfant, un enseignant ne voit que ses classes).
Les utilisateurs non authentifiés n'ont accès qu'aux endpoints de connexion ; la création, la modification et la désactivation des comptes sont réservées aux administrateurs — aucune auto-inscription n'est prévue dans l'application.
Chaque compte créé ou modifié enregistre l'administrateur responsable de l'action, à des fins d'audit.
Les données personnelles des élèves doivent rester confidentielles.
Les messages générés pour les parents sont rédigés en français.
Le traitement IA (synthèse de risque) ne doit pas bloquer l'utilisation du reste de l'application — traitement asynchrone obligatoire.
L'IA ne décide jamais seule : le niveau d'alerte reste modifiable par un humain, et aucun message n'est envoyé sans validation humaine.
Un échec de génération IA doit être visible (statut echoue) et permettre une nouvelle tentative.
Les notifications par email doivent être fiables et ne pas bloquer les autres opérations de l'application.

12. Critères de réussite
Le projet sera considéré comme réussi si :
les enseignants peuvent enregistrer notes, absences, retards et remarques ;
une synthèse de risque de décrochage peut être déclenchée par un professeur principal ou la direction, pour un élève et un trimestre ;
les facteurs de risque et les signaux textuels affichés sont compréhensibles et vérifiables par un professeur principal ;
le professeur principal peut corriger le niveau d'alerte avant tout envoi ;
un message adapté est généré pour les parents, en français, et envoyé par email après validation humaine ;
la direction dispose d'une vue d'ensemble fiable de l'établissement ;
chaque acteur (admin, enseignant, direction, parent) n'accède qu'aux données correspondant à son rôle ;
les utilisateurs, les élèves et les classes peuvent être archivés, restaurés et supprimés définitivement ;
les opérations en masse (archivage, restauration, suppression et affectation d'élèves à une classe) fonctionnent correctement ;
l'ensemble du parcours fonctionne de bout en bout, en ligne.
13. Conclusion
ScolarWatch répond à un besoin concret des établissements scolaires marocains : transformer des signaux de décrochage dispersés et sous-exploités — notes, absences, retards, remarques — en une synthèse claire et actionnable, accessible à chaque acteur selon son rôle. En s'appuyant sur l'IA pour interpréter le texte libre des enseignants, au-delà d'un simple système de seuils, l'application permet à l'administration, la direction et aux professeurs principaux d'agir à temps, tout en gardant la décision finale entre des mains humaines. Les fonctionnalités non retenues dans le socle (assistant conversationnel, notifications WhatsApp, génération de bulletins, etc.) restent planifiées en bonus, une fois cette base stable et démontrable.

Annexe — Note de conception (rôles)
Le rôle "Professeur principal" n'est volontairement pas modélisé comme une valeur du champ role des utilisateurs. Il est représenté par une relation entre une classe et un enseignant (par exemple classes.professeur_principal_id), ce qui permet à un même enseignant d'être professeur principal d'une ou plusieurs classes tout en restant enseignant simple dans d'autres. Ce choix garantit l'intégrité du modèle de données et reflète fidèlement la réalité métier d'un établissement scolaire.
Pourquoi ÉLÈVE ≠ UTILISATEUR. Dans le socle, l'élève n'a pas de compte de connexion : c'est une entité pédagogique (dossier suivi par les adultes autour de lui), pas un compte applicatif. Ce choix explique pourquoi certains attributs (nom, prénom) existent à la fois sur UTILISATEUR et sur ELEVE sans que ce soit une erreur de normalisation — ce sont deux entités distinctes avec des cycles de vie différents. Le jour où le rôle Élève est ajouté (bonus), une relation optionnelle ELEVE (0,1) — POSSEDE_COMPTE — (0,1) UTILISATEUR sera introduite, sans modifier la structure existante.
Pourquoi ENSEIGNE est binaire et non ternaire. Le socle simplifie la relation Enseignant × Classe × Matière : chaque enseignant est rattaché à une seule matière (utilisateurs.id_matiere), et ENSEIGNE ne relie donc que l'enseignant et la classe. Un enseignant polyvalent (plusieurs matières selon la classe) n'est pas représentable en l'état. Si ce besoin apparaît, matiere_id sera ajouté à ENSEIGNE et id_matiere retiré de UTILISATEUR, sans remise en cause du reste du modèle. 

Annexe — Choix technologiques
Cette section liste les technologies retenues pour l'implémentation du socle. Elle est fournie à titre de référence et ne fait pas partie du besoin fonctionnel défini en Phase 1 — les choix techniques relèvent des Phases 3 et 4 du projet.
Couche
Technologie
Remarque
Framework backend
Laravel 13, PHP 8.4


Authentification
Sanctum
Auth multi-rôles via un champ role, cookie-based pour le front Inertia
Frontend
React + Inertia.js
Vite (build), Tailwind CSS (styles)
Routing
routes/api.php (API REST pure, documentée) séparé de routes/web.php (pages Inertia)
Le cœur reste une API Laravel solide, l'interface Inertia la consomme en interne
Base de données
MySQL 8.0


Queue / cache
Redis 7
Traitement asynchrone de la synthèse IA (pattern 202 Accepted)
IA — synthèse de risque
laravel/ai SDK, provider Groq
Structured output + Casts pour stocker les résultats
Tests
Pest v4 (+ PHPUnit, moteur sous-jacent)
Queue::fake(), Ai::fakeAgent()
Documentation API
Scribe (planifié — non encore généré)


Tests manuels
Postman


Conteneurisation — développement
Docker Compose, images officielles, bind mount
Composer exécuté sur l'host
Conteneurisation — production
Dockerfile multi-stage (build Vite + dépendances PHP figées)
Image autonome, déployable — livrable du Sprint 4
Intégration continue (CI)
GitHub Actions — jobs Tests (Pest/PHPUnit) + Pint — livrable du Sprint 4


Déploiement continu (CD)
GitHub Actions — build & push de l'image Docker, déploiement automatique après tests verts — livrable du Sprint 4
Bonus du cahier des charges
Plateforme de déploiement (cible)
AWS EC2 (Ubuntu)


Versionning
Git, Conventional Commits, GitHub Flow
Une branche feature/s* par séance, PR après validation

Meilisearch/Scout et barryvdh/laravel-dompdf ne font plus partie du socle — ils ne seront installés que si l'assistant RAG ou l'export PDF (bonus) sont implémentés.

Annexe — Fonctionnalités bonus
Ces éléments sont de bonnes pratiques ou fonctionnalités identifiées pendant la conception, volontairement reportées après la version socle par contrainte de délai, et non par manque de valeur. Rien n'est abandonné.
Fonctionnalité bonus
Description
Rôle Élève
Ajout d'un 5ᵉ rôle système permettant à l'élève de consulter ses propres notes, absences et remarques, via une relation optionnelle POSSEDE_COMPTE vers ELEVE
Enseignant polyvalent 
Passage d'ENSEIGNE en relation ternaire (Enseignant × Classe × Matière), pour permettre à un enseignant d'enseigner des matières différentes selon la classe 
Assistant conversationnel RAG
Assistant pour parents et enseignants, capable de répondre à des questions sur le suivi d'un élève à partir des données réelles (nécessite Meilisearch + Laravel Scout)
Notifications WhatsApp
Envoi via Meta WhatsApp Cloud API, en plus de l'email — reporté car la vérification du compte professionnel Meta prend plusieurs jours
Génération d'appréciations et de bulletins par IA
Rédaction automatique de l'appréciation de fin de trimestre à partir des notes et remarques
Export PDF
Génération de bulletins et de rapports de synthèse au format PDF (nécessite barryvdh/laravel-dompdf)
Communications multilingues étendues
Messages disponibles en arabe et en anglais, en plus du français
Historique pluriannuel
Modélisation de l'année scolaire comme entité à part entière, pour suivre un élève ou une classe sur plusieurs années
Typologie des évaluations
Distinction quiz / examen / devoir sur les notes, pour affiner les statistiques
Score de confiance IA
Indicateur de confiance associé à chaque synthèse générée par l'IA
Génération automatique en fin de trimestre
Planification (schedule:work) qui déclenche automatiquement une synthèse pour chaque élève à la date de fin de trimestre, en complément du déclenchement manuel qui 
reste la méthode principale du socle



