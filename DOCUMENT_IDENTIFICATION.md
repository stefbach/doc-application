# Système d'Identification des Documents Patients

## Vue d'ensemble

Ce système permet d'identifier et de suivre tous les documents associés à chaque patient de la clinique. Il offre une vue d'ensemble claire du statut de complétion des documents pour faciliter la gestion administrative.

## Catégories de Documents

Le système reconnaît **8 catégories de documents** :

1. **Facture** - Documents de facturation
2. **Contrat** - Contrats signés avec le patient
3. **Simulation Financière** - Simulations de coûts et plans de paiement
4. **Compte Rendu Hospitalisation** - Rapports d'hospitalisation
5. **Compte Rendu Consultation** - Rapports de consultation médicale
6. **Lettre GP** - Lettres du médecin généraliste
7. **Formulaire S2** - Formulaires administratifs S2
8. **Autre** - Documents divers (non comptés dans le taux de complétion)

## Fonctionnalités Principales

### 1. Identification des Documents par Patient

**Fonction** : `identifyPatientDocuments(patientId: string)`

**Retourne** : `PatientDocumentStatus`

Cette fonction analyse tous les documents d'un patient spécifique et retourne :
- Nombre total de documents
- Documents groupés par catégorie
- Liste des catégories manquantes
- Pourcentage de complétion

**Exemple d'utilisation** :
```typescript
const status = await identifyPatientDocuments("patient-uuid")
console.log(status.completionPercentage) // 85%
console.log(status.missingCategories) // ["Lettre GP", "Formulaire S2"]
```

### 2. Vue d'Ensemble de Tous les Patients

**Fonction** : `identifyAllPatientsDocuments()`

**Retourne** : `PatientDocumentStatus[]`

Cette fonction analyse tous les patients de la base de données et retourne un tableau avec le statut de chaque patient.

**Utilisation** : Affichée sur `/dashboard/patients/all`

### 3. Composant Visuel de Statut

**Composant** : `PatientDocumentStatusComponent`

Affiche visuellement le statut des documents avec :
- Barre de progression
- Badge de pourcentage
- Liste des catégories avec indicateurs visuels :
  - ✅ Vert = Document présent
  - ⚠️ Ambre = Document manquant (requis)
  - ⭕ Gris = Document manquant (non requis)
- Liste des documents manquants

## Calcul du Taux de Complétion

Le **taux de complétion** est calculé comme suit :

```
Complétion = (Nb catégories avec documents / Nb catégories requises) × 100
```

**Note importante** : La catégorie "Autre" n'est **pas comptée** dans le calcul de complétion, car elle est facultative.

**Exemple** :
- Catégories requises : 7 (toutes sauf "Autre")
- Catégories avec documents : 6
- Complétion = (6 / 7) × 100 = **85.7%** → arrondi à **86%**

## Pages et Routes

### Page de Recherche Patient
**Route** : `/dashboard/patients`

- Barre de recherche pour trouver un patient
- Bouton "Voir tous les patients et leurs documents" → redirige vers `/dashboard/patients/all`

### Page Vue d'Ensemble
**Route** : `/dashboard/patients/all`

Affiche :
- **Statistiques globales** :
  - Nombre total de patients
  - Nombre de patients avec documents complets
  - Taux de complétion moyen
- **Tableau des patients** avec :
  - Nom du patient
  - Nombre de documents
  - Barre de progression
  - Badge de statut (Complet / Incomplet / En cours)
  - Nombre de documents manquants
  - Bouton "Voir" → redirige vers les détails du patient

### Page Détails Patient
**Route** : `/dashboard/patients/[patientId]/documents`

Affiche :
- Informations du patient
- **2 vues du statut des documents** :
  1. Vue compacte (en haut à droite) : progression uniquement
  2. Vue détaillée : liste complète par catégorie
- Gestionnaire de documents (upload, téléchargement, suppression)

## Structure des Données

### Interface `PatientDocumentStatus`

```typescript
interface PatientDocumentStatus {
  patientId: string              // UUID du patient
  patientName: string | null     // Nom complet
  totalDocuments: number         // Nombre total de documents
  documentsByCategory: DocumentSummaryByCategory[]  // Résumé par catégorie
  missingCategories: string[]    // Catégories manquantes
  completionPercentage: number   // Pourcentage de complétion (0-100)
}
```

### Interface `DocumentSummaryByCategory`

```typescript
interface DocumentSummaryByCategory {
  category: string         // Nom de la catégorie
  count: number           // Nombre de documents dans cette catégorie
  documents: DocumentType[]  // Liste des documents
}
```

## Indicateurs Visuels

### Badges de Statut
- **Complet** (Vert) : `completionPercentage === 100`
- **Incomplet** (Ambre) : `missingCategories.length > 0`
- **En cours** (Gris) : Autres cas

### Indicateurs de Catégorie
- ✅ **CheckCircle2** (Vert) : Documents présents
- ⚠️ **AlertCircle** (Ambre) : Documents manquants (catégorie requise)
- ❌ **XCircle** (Gris) : Documents manquants (catégorie "Autre")

### Couleurs
- **Vert** : Succès, complétion
- **Ambre** : Attention, documents manquants
- **Gris** : Neutre, non urgent

## Flux Utilisateur

### Scénario 1 : Consulter le statut d'un patient spécifique
1. Aller sur `/dashboard/patients`
2. Rechercher le patient par nom
3. Cliquer sur "Voir Documents"
4. Consulter le statut visuel (progression, documents manquants)

### Scénario 2 : Vue d'ensemble de tous les patients
1. Aller sur `/dashboard/patients`
2. Cliquer sur "Voir tous les patients et leurs documents"
3. Consulter le tableau avec tous les patients
4. Trier mentalement par taux de complétion
5. Cliquer sur "Voir" pour un patient spécifique

### Scénario 3 : Upload d'un document
1. Aller sur la page d'un patient
2. Uploader un document avec sa catégorie
3. Le statut est automatiquement mis à jour
4. La barre de progression reflète le nouveau pourcentage

## Optimisations et Performance

### Caching
- Les fonctions utilisent `noStore()` pour éviter le cache de Next.js
- Permet d'avoir des données toujours à jour

### Revalidation
- `revalidatePath()` est appelé après chaque upload/suppression
- Assure que les composants Server se mettent à jour automatiquement

## Évolutions Futures

### Court Terme
- [ ] Filtrage et tri dans le tableau "tous les patients"
- [ ] Export Excel/PDF du rapport de statut
- [ ] Notifications pour documents manquants

### Moyen Terme
- [ ] Alertes automatiques pour documents expirés
- [ ] Rappels par email pour documents manquants
- [ ] Statistiques avancées (graphiques de complétion dans le temps)

### Long Terme
- [ ] Catégories personnalisables par clinique
- [ ] Workflow d'approbation de documents
- [ ] Intégration avec système de facturation

## Maintenance

### Ajouter une Nouvelle Catégorie

1. Modifier `ALL_DOCUMENT_CATEGORIES` dans `/app/actions/patient-actions.ts`
2. Ajouter la catégorie dans `documentCategories` de `/components/patient-document-manager.tsx`
3. (Optionnel) Ajouter un mapping dans `categoryToPatientColumnMap` si nécessaire

### Modifier le Calcul de Complétion

Éditer la logique dans la fonction `identifyPatientDocuments()` :

```typescript
const requiredCategories = ALL_DOCUMENT_CATEGORIES.filter(
  (cat) => cat !== "Autre" && cat !== "Nouvelle Catégorie Optionnelle"
)
```

## Support

Pour toute question ou problème, consulter :
- Code source : `/app/actions/patient-actions.ts`
- Composant visuel : `/components/patient-document-status.tsx`
- Page vue d'ensemble : `/app/dashboard/patients/all/page.tsx`
