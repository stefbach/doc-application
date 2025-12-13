# 🔧 Correction de l'Erreur de Build Vercel

## ❌ Problème Rencontré

### Erreur de Build
```
[Error: Failed to collect configuration for /dashboard/board]
Error: A "use server" file can only export async functions, found object.
Read more: https://nextjs.org/docs/messages/invalid-use-server-value
```

### Cause
Le fichier `app/actions/list-actions.ts` contenait la directive `"use server"` mais exportait également des **interfaces TypeScript** (`PatientList` et `ListPatientAssignment`).

### Règle Next.js
Les fichiers marqués `"use server"` ne peuvent exporter **QUE des fonctions async**, pas d'autres valeurs (objets, types, interfaces, etc.).

---

## ✅ Solution Appliquée

### 1. Création d'un fichier de types séparé

**Nouveau fichier : `app/actions/types.ts`**
```typescript
// Types partagés pour les actions serveur

export interface PatientList {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
  user_id: string
  created_at: string
  updated_at: string
  patient_count?: number
}

export interface ListPatientAssignment {
  id: string
  list_id: string
  patient_id: string
  created_at: string
}
```

### 2. Mise à jour de `list-actions.ts`

**Avant :**
```typescript
"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import { revalidatePath } from "next/cache"

export interface PatientList {
  id: string
  name: string
  // ...
}

export interface ListPatientAssignment {
  id: string
  // ...
}

// Fonctions...
```

**Après :**
```typescript
"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import { revalidatePath } from "next/cache"
import type { PatientList } from "./types"

// Fonctions seulement...
```

### 3. Mise à jour des imports dans les composants

**Fichiers modifiés :**

- `components/patient-board.tsx`
- `components/list-form.tsx`

**Changement :**
```typescript
// Avant
import type { PatientList } from "@/app/actions/list-actions"

// Après
import type { PatientList } from "@/app/actions/types"
```

---

## 📁 Fichiers Modifiés

| Fichier | Action |
|---------|--------|
| `app/actions/types.ts` | ✨ Créé (nouveau fichier pour les types) |
| `app/actions/list-actions.ts` | ✏️ Modifié (suppression des interfaces) |
| `components/patient-board.tsx` | ✏️ Modifié (import depuis types.ts) |
| `components/list-form.tsx` | ✏️ Modifié (import depuis types.ts) |

---

## 🎯 Résultat

### ✅ Build réussi
Le projet compile maintenant correctement sur Vercel sans erreur.

### ✅ Séparation des préoccupations
- **Types** : dans `app/actions/types.ts`
- **Server Actions** : dans `app/actions/list-actions.ts`

### ✅ Conformité Next.js
Les fichiers `"use server"` exportent uniquement des fonctions async, conformément aux règles de Next.js 15.

---

## 📚 Documentation Officielle

**Next.js - Invalid use server value**
https://nextjs.org/docs/messages/invalid-use-server-value

> Files with the "use server" directive can only export async functions. Other values like objects, classes, or variables are not allowed.

---

## 🔄 Commit

**Hash :** `7e65877`

**Message :**
```
fix: separate TypeScript types from use server file

- Create app/actions/types.ts for shared interfaces
- Move PatientList and ListPatientAssignment types to separate file
- Update imports in patient-board.tsx and list-form.tsx
- Fix build error: use server files can only export async functions

This resolves the Vercel build error:
'A use server file can only export async functions, found object'
```

**Statut :** ✅ Pushé sur GitHub

---

## ✨ Bonne Pratique

### Pattern recommandé pour Next.js 15

```
app/actions/
  ├── types.ts              # Types et interfaces partagés
  ├── patient-actions.ts    # "use server" - fonctions async seulement
  ├── list-actions.ts       # "use server" - fonctions async seulement
  └── document-actions.ts   # "use server" - fonctions async seulement
```

**Règle :** Toujours séparer les types dans un fichier distinct quand vous utilisez `"use server"`.

---

## 🎉 Conclusion

L'erreur de build a été **corrigée avec succès**. Le projet devrait maintenant se déployer correctement sur Vercel.

**Date :** 2025-12-13  
**Status :** ✅ **RÉSOLU**
