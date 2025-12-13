# 📊 Tableau de Bord des Patients - Guide Complet

## Vue d'ensemble

Le **Tableau de Bord des Patients** est une interface de type Kanban qui permet d'organiser vos patients en colonnes selon leur statut de documents et de créer des listes personnalisées pour une organisation flexible.

## 🎯 Fonctionnalités Principales

### 1. Colonnes par Défaut (Statut de Documents)

Le tableau affiche automatiquement 3 colonnes basées sur le statut de complétion des documents :

#### 🟢 Dossiers Complets (100%)
- Patients ayant tous les documents requis
- Badge vert avec icône de validation
- Couleur de fond : vert pâle

#### 🟡 En Cours (1-99%)
- Patients ayant au moins un document mais pas tous
- Badge ambre avec icône d'horloge
- Couleur de fond : ambre pâle

#### 🔴 À Compléter (0%)
- Patients n'ayant aucun document
- Badge rouge avec icône d'alerte
- Couleur de fond : rouge pâle

### 2. Listes Personnalisées

Vous pouvez créer vos propres listes pour organiser les patients selon vos besoins :

- **Patients prioritaires**
- **Suivis spéciaux**
- **À contacter**
- **En attente**
- ... et toute autre catégorie utile !

## 🚀 Accès au Tableau de Bord

### Depuis la page de recherche
1. Aller sur `/dashboard/patients`
2. Cliquer sur le bouton **"Tableau de bord"**

### URL directe
- Accès direct : `/dashboard/board`

## 📋 Utilisation

### Créer une Nouvelle Liste

1. Cliquer sur **"Nouvelle Liste"** en haut à droite
2. Remplir le formulaire :
   - **Nom*** : Obligatoire (ex: "Patients prioritaires")
   - **Description** : Optionnelle (ex: "Patients nécessitant un suivi urgent")
   - **Couleur** : Choisir parmi 8 couleurs prédéfinies
3. Aperçu en temps réel
4. Cliquer sur **"Créer la liste"**

### Ajouter un Patient à une Liste

**Méthode 1 : Depuis le menu du patient**
1. Cliquer sur les 3 points (⋮) sur une carte patient
2. Sélectionner **"Ajouter à une liste"**
3. Choisir la liste dans la boîte de dialogue
4. Le patient apparaît immédiatement dans la liste

**Méthode 2 : Drag & Drop (à venir)**
- Glisser-déposer un patient d'une colonne à l'autre

### Retirer un Patient d'une Liste

1. Dans une colonne de liste personnalisée
2. Cliquer sur les 3 points (⋮) sur la carte du patient
3. Sélectionner **"Retirer de cette liste"**
4. Confirmation : le patient disparaît de la liste

### Modifier une Liste

1. Cliquer sur les 3 points (⋮) dans l'en-tête de la liste
2. Sélectionner **"Modifier"**
3. Modifier le nom, la description ou la couleur
4. Cliquer sur **"Mettre à jour"**

### Supprimer une Liste

1. Cliquer sur les 3 points (⋮) dans l'en-tête de la liste
2. Sélectionner **"Supprimer"**
3. Confirmer la suppression
4. ⚠️ Attention : la liste sera supprimée mais les patients ne seront pas supprimés

## 🎨 Interface Utilisateur

### Carte Patient

Chaque carte patient affiche :
- **Nom du patient**
- **Nombre de documents** (ex: "8 documents")
- **Barre de progression** de complétion (0-100%)
- **Badges des catégories manquantes** (max 2 affichés + compteur)
- **Menu d'actions** (3 points)

### Exemple de Carte

```
┌────────────────────────────────┐
│ Dupont Jean              [⋮]   │
│ 8 documents                     │
│                                 │
│ Complétion        86%           │
│ [████████░░]                    │
│                                 │
│ [Formulaire S2]                │
└────────────────────────────────┘
```

### En-tête de Colonne

Chaque colonne affiche :
- **Icône** de la colonne
- **Titre** de la colonne
- **Badge avec le nombre** de patients
- **Menu d'actions** (pour les listes personnalisées)

## 🔄 Flux de Travail Recommandé

### Scénario 1 : Organisation par Priorité

```
1. Créer les listes :
   - "Urgent" (couleur rouge)
   - "Prioritaire" (couleur orange)
   - "Normal" (couleur bleu)

2. Parcourir les colonnes de statut

3. Ajouter les patients aux listes appropriées

4. Traiter d'abord la liste "Urgent"
```

### Scénario 2 : Suivi par Étape

```
1. Créer les listes :
   - "À contacter" (couleur jaune)
   - "Rendez-vous programmé" (couleur bleu)
   - "Documents en attente" (couleur orange)
   - "Complet" (couleur vert)

2. Déplacer les patients selon leur progression

3. Visualiser l'avancement global
```

### Scénario 3 : Organisation par Médecin

```
1. Créer les listes par médecin :
   - "Dr. Martin" (couleur bleu)
   - "Dr. Dupont" (couleur vert)
   - "Dr. Leclerc" (couleur violet)

2. Assigner les patients à leur médecin

3. Chaque médecin peut voir sa liste
```

## 📊 Statistiques

### Dans chaque colonne
- **Compteur** de patients dans le badge
- Scroll automatique si plus de patients que l'espace disponible

### Actions Disponibles

| Action | Localisation | Description |
|--------|--------------|-------------|
| Voir détails | Menu patient | Accède à la page détails du patient |
| Ajouter à liste | Menu patient | Ouvre le dialogue de sélection de liste |
| Retirer de liste | Menu patient (listes) | Retire le patient de la liste actuelle |
| Modifier liste | Menu colonne (listes) | Édite le nom/description/couleur |
| Supprimer liste | Menu colonne (listes) | Supprime la liste (pas les patients) |

## 🎨 Couleurs Prédéfinies

| Couleur | Hex | Usage Recommandé |
|---------|-----|------------------|
| Bleu | #3b82f6 | Catégories générales |
| Vert | #22c55e | Complet, validé |
| Rouge | #ef4444 | Urgent, prioritaire |
| Jaune | #eab308 | En attente, à faire |
| Violet | #a855f7 | Spécialisé |
| Rose | #ec4899 | Suivi particulier |
| Orange | #f97316 | En cours |
| Cyan | #06b6d4 | Nouveau |

## 🔐 Sécurité & Permissions

### Row Level Security (RLS)

Chaque utilisateur ne peut voir et modifier que ses propres listes :
- ✅ Visualiser ses listes
- ✅ Créer de nouvelles listes
- ✅ Modifier ses listes
- ✅ Supprimer ses listes
- ✅ Assigner des patients à ses listes
- ❌ Voir les listes d'autres utilisateurs

### Données Patients

- Les patients eux-mêmes ne sont **jamais supprimés**
- Seules les assignations aux listes sont modifiées
- Les données de documents restent intactes

## 🗄️ Structure de la Base de Données

### Table `patient_lists`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| user_id | UUID | Propriétaire de la liste |
| name | TEXT | Nom de la liste |
| description | TEXT | Description (optionnel) |
| color | TEXT | Couleur hex (ex: #3b82f6) |
| icon | TEXT | Nom d'icône (optionnel) |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de modification |

### Table `list_patient_assignments`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| list_id | UUID | Référence à patient_lists |
| patient_id | UUID | Référence à patients |
| created_at | TIMESTAMP | Date d'ajout |

**Contrainte** : Un patient ne peut être qu'une seule fois dans une liste (UNIQUE)

## 📝 Installation

### 1. Exécuter la Migration SQL

Dans Supabase SQL Editor, exécuter le fichier `supabase_migrations.sql` :

```sql
-- Création des tables patient_lists et list_patient_assignments
-- Configuration des RLS policies
-- Création des index pour performance
```

### 2. Vérifier les Permissions

```sql
-- Tester la création d'une liste
SELECT * FROM patient_lists WHERE user_id = auth.uid();

-- Tester l'assignation
SELECT * FROM list_patient_assignments;
```

## 🐛 Dépannage

### Problème : "Permission denied"
**Solution** : Vérifier que les RLS policies sont actives
```sql
ALTER TABLE patient_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_patient_assignments ENABLE ROW LEVEL SECURITY;
```

### Problème : Les listes ne s'affichent pas
**Solution** : Vérifier que les tables existent
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('patient_lists', 'list_patient_assignments');
```

### Problème : Impossible d'ajouter un patient
**Solution** : Vérifier que le patient existe
```sql
SELECT id, full_name FROM patients WHERE id = 'patient-uuid';
```

## 🚀 Évolutions Futures

### Court Terme
- [ ] Drag & Drop entre colonnes
- [ ] Filtres et recherche dans le tableau
- [ ] Tri des cartes (alphabétique, date, complétion)
- [ ] Compteurs globaux par liste

### Moyen Terme
- [ ] Export de liste en PDF/Excel
- [ ] Partage de listes entre utilisateurs
- [ ] Templates de listes prédéfinies
- [ ] Notifications de changements

### Long Terme
- [ ] Automatisations (ajout automatique selon critères)
- [ ] Workflow personnalisés
- [ ] Historique des déplacements
- [ ] Analytics par liste

## 💡 Cas d'Usage Réels

### Cabinet Médical
```
Listes créées :
- "Consultations du jour" (bleu)
- "Suivis post-opératoires" (orange)
- "Patients à rappeler" (jaune)
- "Dossiers à compléter" (rouge)
```

### Clinique Spécialisée
```
Listes créées :
- "Pré-opératoire" (bleu)
- "Post-opératoire J+7" (vert)
- "Post-opératoire J+30" (cyan)
- "Suivi à 6 mois" (violet)
```

### Service Administratif
```
Listes créées :
- "Factures en attente" (orange)
- "Dossiers complets" (vert)
- "Contrats à signer" (rouge)
- "Nouveaux patients" (bleu)
```

## 📞 Support

Pour toute question ou problème :
- **Documentation** : `TABLEAU_DE_BORD.md` (ce fichier)
- **Architecture** : `ARCHITECTURE_DOCUMENTS.md`
- **Code source** : `/app/dashboard/board/`

---

**Dernière mise à jour** : 2025-12-13  
**Version** : 1.0.0

*Développé avec ❤️ pour Obesity Care Clinic*
