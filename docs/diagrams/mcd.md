# MCD ScolarWatch — Socle (Méthode Merise)

Version socle : 10 entités. APPRECIATION et le compte de connexion élève (CORRESPOND) sortent du modèle — bonus. Rôle Élève reporté en bonus.

---

## 1. Entités et attributs (10 entités)

```
UTILISATEUR
    # id_utilisateur
    nom
    prenom
    username (unique)
    email
    mot_de_passe
    telephone
    adresse
    role
    is_active

ELEVE
    # id_eleve
    nom
    prenom
    genre
    date_naissance
    code_massar
    photo

CLASSE
    # id_classe
    nom
    niveau
    annee_scolaire
    capacite

MATIERE
    # id_matiere
    nom
    code

NOTE
    # id_note
    valeur
    trimestre
    date

ABSENCE
    # id_absence
    date_absence
    justifiee
    motif

RETARD
    # id_retard
    date_retard
    justifiee
    minutes_retard
    motif

REMARQUE
    # id_remarque
    contenu
    categorie
    trimestre
    date_remarque

SYNTHESE_IA
    # id_synthese
    trimestre
    statut
    niveau_alerte
    niveau_alerte_corrige
    facteurs_risque
    signaux_textuels
    recommandations
    message_parent
    genere_le

NOTIFICATION
    # id_notification
    titre
    message
    statut_envoi
    envoye_le
    lu
```

**Remarque :** `cree_par` / `updated_by` (traçabilité d'audit sur UTILISATEUR) restent des colonnes techniques exclues du MCD, ajoutées uniquement au MLD.

---

## 2. Relations et cardinalités (18 lignes, toutes binaires)

| # | Relation | Entité A | Card. A | Entité B | Card. B |
|---|---|---|---|---|---|
| 1 | APPARTIENT_A | ELEVE | (1,1) | CLASSE | (0,N) |
| 2 | DIRIGE_PAR | CLASSE | (0,1) | UTILISATEUR | (0,N) |
| 3a | ENSEIGNE_MATIERE | UTILISATEUR | (0,1) | MATIERE | (0,N) |
| 3b | ENSEIGNE_CLASSE | UTILISATEUR | (0,N) | CLASSE | (0,N) |
| 4 | EST_TUTEUR_DE | UTILISATEUR | (0,N) | ELEVE | (0,N) |
| 5 | CONCERNE_ELEVE | NOTE | (1,1) | ELEVE | (0,N) |
| 6 | PORTE_SUR | NOTE | (1,1) | MATIERE | (0,N) |
| 7 | SAISIE_PAR | NOTE | (1,1) | UTILISATEUR | (0,N) |
| 8 | CONCERNE_ELEVE | ABSENCE | (1,1) | ELEVE | (0,N) |
| 9 | SAISIE_PAR | ABSENCE | (1,1) | UTILISATEUR | (0,N) |
| 10 | CONCERNE_ELEVE | RETARD | (1,1) | ELEVE | (0,N) |
| 11 | SAISIE_PAR | RETARD | (1,1) | UTILISATEUR | (0,N) |
| 12 | CONCERNE_ELEVE | REMARQUE | (1,1) | ELEVE | (0,N) |
| 13 | REDIGEE_PAR | REMARQUE | (1,1) | UTILISATEUR | (0,N) |
| 14 | CONCERNE_ELEVE | SYNTHESE_IA | (1,1) | ELEVE | (0,N) |
| 15 | DEMANDEE_PAR | SYNTHESE_IA | (1,1) | UTILISATEUR | (0,N) |
| 16 | DESTINEE_A | NOTIFICATION | (1,1) | UTILISATEUR | (0,N) |
| 17 | DECOULE_DE | NOTIFICATION | (0,1) | SYNTHESE_IA | (0,N) |

**Note :** Plus de relation ternaire — la matière d'un enseignant se déduit directement via ENSEIGNE_MATIERE, sans passer par une association à trois branches.

**Point de vigilance pour le dessin :** CONCERNE_ELEVE (×5) et SAISIE_PAR (×3) partagent leur nom entre plusieurs paires d'entités différentes — normal en Merise, mais chaque ligne doit rester tracée séparément vers sa propre cible, sans faisceau commun.

---

## 3. Disposition recommandée

- **Bloc structure pédagogique (haut) :** UTILISATEUR, CLASSE, MATIERE, ELEVE
- **Bloc suivi (centre) :** NOTE, ABSENCE, RETARD, REMARQUE
- **Bloc IA et communication (bas) :** SYNTHESE_IA, NOTIFICATION

Les lignes ne doivent pas croiser d'un bloc à l'autre.

---

## 4. Checklist de vérification avant export (nombre de connexions par entité)

| Entité | Connexions attendues | Détail |
|---|---|---|
| UTILISATEUR | 10 | DIRIGE_PAR, ENSEIGNE_MATIERE, ENSEIGNE_CLASSE, EST_TUTEUR_DE, SAISIE_PAR×3, REDIGEE_PAR, DEMANDEE_PAR, DESTINEE_A |
| CLASSE | 3 | APPARTIENT_A, DIRIGE_PAR, ENSEIGNE |
| MATIERE | 2 | ENSEIGNE, PORTE_SUR |
| ELEVE | 7 | APPARTIENT_A, EST_TUTEUR_DE, CONCERNE_ELEVE×5 |
| NOTE | 3 | CONCERNE_ELEVE, PORTE_SUR, SAISIE_PAR |
| ABSENCE | 2 | CONCERNE_ELEVE, SAISIE_PAR |
| RETARD | 2 | CONCERNE_ELEVE, SAISIE_PAR |
| REMARQUE | 2 | CONCERNE_ELEVE, REDIGEE_PAR |
| SYNTHESE_IA | 3 | CONCERNE_ELEVE, DEMANDEE_PAR, DECOULE_DE |
| NOTIFICATION | 2 | DESTINEE_A, DECOULE_DE |

**Total de contrôle :** 10+3+2+7+3+2+2+2+3+2 = **36**, soit 18 relations binaires × 2 = 36. Si ce total ne correspond pas une fois le diagramme terminé, recompter avant d'exporter.
