# 🔍 DIAGNOSTIC - Problème de Téléchargement

## 🔴 PROBLÈME RAPPORTÉ
"On ne peut plus télécharger les documents"

## ✅ CODE DE TÉLÉCHARGEMENT VÉRIFIÉ
Le code de téléchargement est correct et n'a pas été modifié récemment.

### Fonction handleDownload (client)
```typescript
const handleDownload = async (filePath: string, originalFileName: string) => {
  const url = await getSignedUrlForDownload(filePath)
  if (url) {
    // Crée un lien de téléchargement
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", originalFileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
```

### Fonction getSignedUrlForDownload (serveur)
```typescript
export async function getSignedUrlForDownload(filePath: string): Promise<string | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.storage
    .from("patient-documents")
    .createSignedUrl(filePath, 60 * 5) // 5 minutes
  
  if (error) {
    console.error("Error creating signed URL:", error.message)
    return null
  }
  return data.signedUrl
}
```

## 🔍 CAUSES POSSIBLES

### 1. Permissions Supabase Storage
**Problème** : Les politiques RLS (Row Level Security) sur le bucket "patient-documents" peuvent bloquer l'accès.

**Solution** : Vérifier les politiques Supabase Storage :
```sql
-- Politique pour permettre le téléchargement
CREATE POLICY "Allow authenticated users to download"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'patient-documents');
```

### 2. Bouton de Téléchargement Non Visible
**Problème** : Le bouton existe mais n'est pas cliquable.

**Vérification** : 
1. Ouvrir la page d'un patient avec documents
2. Regarder si le bouton "Télécharger" est présent
3. Vérifier la console navigateur (F12) pour des erreurs

### 3. Erreur JavaScript
**Problème** : Une erreur JavaScript empêche le clic.

**Diagnostic** :
1. Ouvrir la console navigateur (F12)
2. Onglet "Console"
3. Cliquer sur "Télécharger"
4. Noter les erreurs rouges

### 4. Storage Path Incorrect
**Problème** : Le chemin vers le fichier est incorrect.

**Vérification** :
1. Console navigateur (F12)
2. Chercher les logs `[handleDownload]` et `[getSignedUrlForDownload]`
3. Vérifier le `filePath` affiché

## 📝 ÉTAPES DE DIAGNOSTIC

### Étape 1 : Vérifier la Console Navigateur
1. Ouvrir l'application
2. Aller sur la page d'un patient avec documents
3. Appuyer sur F12
4. Onglet "Console"
5. Cliquer sur "Télécharger" sur un document
6. **Copier TOUS les messages de la console**

### Étape 2 : Vérifier Supabase Storage
1. Aller sur https://supabase.com/dashboard
2. Storage → Buckets → "patient-documents"
3. Vérifier que les fichiers existent
4. Cliquer sur un fichier → "Get URL"
5. Essayer d'ouvrir l'URL dans un navigateur

### Étape 3 : Vérifier les Politiques RLS
1. Aller sur https://supabase.com/dashboard
2. Storage → Policies
3. Bucket "patient-documents"
4. Vérifier qu'il existe une politique "SELECT" pour les utilisateurs authentifiés

## 🔧 SOLUTIONS POSSIBLES

### Solution 1 : Ajouter les Politiques Supabase Storage
```sql
-- Dans Supabase SQL Editor

-- Permettre SELECT (lecture/téléchargement)
CREATE POLICY "Authenticated users can download files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'patient-documents');

-- Permettre INSERT (upload)
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-documents');

-- Permettre DELETE (suppression)
CREATE POLICY "Authenticated users can delete their files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'patient-documents');
```

### Solution 2 : Vérifier la Configuration du Bucket
Dans Supabase Dashboard → Storage → patient-documents :
- ✅ Bucket doit être **PUBLIC** ou avoir des politiques RLS correctes
- ✅ MIME types autorisés : tous (ou spécifier : pdf, jpg, png, doc, docx, etc.)

### Solution 3 : Logs Détaillés
Le code contient déjà des logs détaillés. Partagez :
1. Les logs de la console navigateur
2. Le message d'erreur exact (si affiché)
3. L'URL Vercel de l'application

## 📊 INFORMATIONS À PARTAGER

Pour que je puisse vous aider précisément, partagez :

1. **Console navigateur** :
   - Screenshot ou copie des messages après avoir cliqué "Télécharger"

2. **Message d'erreur** :
   - Le toast (notification) qui s'affiche
   - Ou "rien ne se passe"

3. **Comportement** :
   - Le bouton est-il visible ?
   - Le bouton est-il grisé/désactivé ?
   - Un message d'erreur s'affiche ?
   - Le téléchargement commence puis échoue ?

4. **Test Supabase** :
   - Les fichiers sont-ils visibles dans Supabase Storage ?
   - Pouvez-vous télécharger un fichier depuis Supabase Dashboard ?

## ⚡ ACTION IMMÉDIATE

**Testez ceci MAINTENANT** :

1. Ouvrir l'application
2. F12 → Console
3. Aller sur un patient avec documents
4. Cliquer "Télécharger"
5. **Copier TOUS les messages de la console**
6. **Partager les messages**

Je pourrai alors identifier précisément le problème et le corriger !

---

**Date** : 2025-12-14  
**Application** : https://v0-supabase-patient-integrat-git-a9277c-bachs-projects-25b173f6.vercel.app
