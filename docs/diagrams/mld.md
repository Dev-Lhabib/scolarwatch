# MLD ScolarWatch — Socle

Modèle Logique de Dérivé du MCD à 10 entités. Les colonnes `cree_par` et `updated_by` (traçabilité d'audit) sont ajoutées sur UTILISATEUR.

---

## Tables

### UTILISATEUR
```
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
id_matiere → MATIERE(id_matiere)
```

### CLASSE
```
# id_classe
nom
niveau
annee_scolaire
capacite
id_utilisateur_principal → UTILISATEUR(id_utilisateur)
```

### ELEVE
```
# id_eleve
nom
prenom
genre
date_naissance
code_massar
photo
id_classe → CLASSE(id_classe)
```

### MATIERE
```
# id_matiere
nom
code
```

### ENSEIGNE
```
# id_enseigne
id_utilisateur → UTILISATEUR(id_utilisateur)
id_classe → CLASSE(id_classe)
```

### EST_TUTEUR_DE
```
# id_tuteur
id_utilisateur → UTILISATEUR(id_utilisateur)
id_eleve → ELEVE(id_eleve)
```

### NOTE
```
# id_note
valeur
trimestre
date
id_eleve → ELEVE(id_eleve)
id_matiere → MATIERE(id_matiere)
id_utilisateur → UTILISATEUR(id_utilisateur)
```

### ABSENCE
```
# id_absence
date_absence
justifiee
motif
id_eleve → ELEVE(id_eleve)
id_utilisateur → UTILISATEUR(id_utilisateur)
```

### RETARD
```
# id_retard
date_retard
justifiee
minutes_retard
motif
id_eleve → ELEVE(id_eleve)
id_utilisateur → UTILISATEUR(id_utilisateur)
```

### REMARQUE
```
# id_remarque
contenu
categorie
trimestre
date_remarque
id_eleve → ELEVE(id_eleve)
id_utilisateur → UTILISATEUR(id_utilisateur)
```

### SYNTHESE_IA
```
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
id_eleve → ELEVE(id_eleve)
id_utilisateur_demandeur → UTILISATEUR(id_utilisateur)
```

### NOTIFICATION
```
# id_notification
titre
message
statut_envoi
envoye_le
lu
id_utilisateur_destinataire → UTILISATEUR(id_utilisateur)
id_synthese → SYNTHESE_IA(id_synthese)
```

---

## Résumé des clés étrangères

| Table | FK | Référence | Type |
|---|---|---|---|
| UTILISATEUR | id_matiere | MATIERE(id_matiere) | (0,1) |
| CLASSE | id_utilisateur_principal | UTILISATEUR(id_utilisateur) | (0,1) |
| ELEVE | id_classe | CLASSE(id_classe) | (1,1) |
| ENSEIGNE | id_utilisateur | UTILISATEUR(id_utilisateur) | (0,N) |
| ENSEIGNE | id_classe | CLASSE(id_classe) | (0,N) |
| EST_TUTEUR_DE | id_utilisateur | UTILISATEUR(id_utilisateur) | (0,N) |
| EST_TUTEUR_DE | id_eleve | ELEVE(id_eleve) | (0,N) |
| NOTE | id_eleve | ELEVE(id_eleve) | (1,1) |
| NOTE | id_matiere | MATIERE(id_matiere) | (1,1) |
| NOTE | id_utilisateur | UTILISATEUR(id_utilisateur) | (1,1) |
| ABSENCE | id_eleve | ELEVE(id_eleve) | (1,1) |
| ABSENCE | id_utilisateur | UTILISATEUR(id_utilisateur) | (1,1) |
| RETARD | id_eleve | ELEVE(id_eleve) | (1,1) |
| RETARD | id_utilisateur | UTILISATEUR(id_utilisateur) | (1,1) |
| REMARQUE | id_eleve | ELEVE(id_eleve) | (1,1) |
| REMARQUE | id_utilisateur | UTILISATEUR(id_utilisateur) | (1,1) |
| SYNTHESE_IA | id_eleve | ELEVE(id_eleve) | (1,1) |
| SYNTHESE_IA | id_utilisateur_demandeur | UTILISATEUR(id_utilisateur) | (1,1) |
| NOTIFICATION | id_utilisateur_destinataire | UTILISATEUR(id_utilisateur) | (1,1) |
| NOTIFICATION | id_synthese | SYNTHESE_IA(id_synthese) | (0,1) |
