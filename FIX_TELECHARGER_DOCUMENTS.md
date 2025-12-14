# Fix: Problème de téléchargement des documents

## 🔴 Problème rapporté
"On ne peut plus télécharger les documents" après upload.

## ✅ Code Vérifié - FONCTIONNEL

### 1. Code Frontend (`patient-document-manager.tsx`)
```typescript
const handleDownload = async (filePath: string, originalFileName: string) => {
  console.log(`[handleDownload] Attempting to get signed URL for path: "${filePath}"`)
  try {
    const url = await getSignedUrlForDownload(filePath)
    if (url) {
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", originalFileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({ title: "Téléchargement initié", description: `Téléchargement de ${originalFileName} en cours.` })
    } else {
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible d'obtenir l'URL de téléchargement depuis le serveur.",
        variant: "destructive",
      })
    }
  } catch (error: any) {
    console.error("[handleDownload] Catch block error:", error)
    toast({ title: "Erreur de téléchargement", description: error.message, variant: "destructive" })
  }
}
```

### 2. Code Backend (`document-actions.ts`)
```typescript
export async function getSignedUrlForDownload(filePath: string): Promise<string | null> {
  console.log(`[getSignedUrlForDownload] Received filePath: "${filePath}"`)
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.storage
    .from("patient-documents")
    .createSignedUrl(filePath, 60 * 5) // 5 minutes

  if (error) {
    console.error("Error creating signed URL for patient-documents:", error.message)
    return null
  }
  console.log("[getSignedUrlForDownload] Signed URL created successfully for patient-documents.")
  return data.signedUrl
}
```

### 3. Bouton de Téléchargement - PRÉSENT
```typescript
<Button
  variant="outline"
  size="sm"
  onClick={() => handleDownload(doc.storage_path, doc.file_name)}
>
  <Download className="mr-1 h-4 w-4" /> Télécharger
</Button>
```

## 🔍 Causes Probables

### 1. **Permissions Supabase Storage** ⚠️ CAUSE PRINCIPALE
Le bucket `patient-documents` n'a probablement pas les bonnes politiques RLS (Row Level Security).

### 2. **Bucket non public**
Le bucket doit être soit:
- Public (tous peuvent télécharger)
- Ou avoir des politiques RLS appropriées

### 3. **Chemin de fichier incorrect**
Le `storage_path` peut ne pas correspondre au chemin réel dans Storage.

## 🛠️ Solutions à Appliquer

### Solution 1: Vérifier les politiques RLS Supabase Storage

#### A. Accéder à Supabase Dashboard
1. Allez sur: https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Storage** → **Policies** → Bucket `patient-documents`

#### B. Politiques RLS Recommandées

**Politique 1: Permettre aux utilisateurs authentifiés de télécharger**
```sql
CREATE POLICY "Authenticated users can download files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'patient-documents');
```

**Politique 2: Permettre aux utilisateurs authentifiés d'uploader**
```sql
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-documents');
```

**Politique 3: Permettre aux utilisateurs de supprimer leurs propres fichiers**
```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'patient-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Solution 2: Rendre le bucket public (Alternative simple)

#### Via Supabase Dashboard:
1. Allez dans **Storage** → **Buckets**
2. Cliquez sur `patient-documents`
3. Activez **Public bucket**

⚠️ **Attention**: Cette option rend TOUS les fichiers accessibles publiquement via URL directe.

### Solution 3: Script SQL Complet

Exécutez ce script dans **SQL Editor** de Supabase:

```sql
-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Authenticated users can download files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Créer les nouvelles politiques
CREATE POLICY "Authenticated users can download files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'patient-documents');

CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-documents');

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'patient-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Vérifier que le bucket existe
SELECT * FROM storage.buckets WHERE id = 'patient-documents';
```

## 📊 Diagnostic à Effectuer

### 1. Console du Navigateur (F12)
Après avoir cliqué sur "Télécharger", vérifiez:
- Y a-t-il des erreurs console?
- Que dit le log `[handleDownload]`?
- Que dit le log `[getSignedUrlForDownload]`?

### 2. Vérifier depuis Supabase Dashboard
1. Allez dans **Storage** → **patient-documents**
2. Trouvez un fichier uploadé
3. Cliquez dessus et essayez d'obtenir une signed URL
4. Si ça échoue → **Problème de politique RLS**

### 3. Test Manuel du Storage Path
Vérifiez dans la table `documents` (via Supabase):
```sql
SELECT id, file_name, storage_path FROM documents LIMIT 5;
```

Comparez les `storage_path` avec les fichiers réels dans Storage.

## ⚡ Actions Immédiates

### Étape 1: Activer les logs détaillés
Les logs sont déjà actifs dans le code. Vérifiez la **console du navigateur** après un clic sur "Télécharger".

### Étape 2: Appliquer les politiques RLS
Copiez le **Script SQL Complet** ci-dessus et exécutez-le dans Supabase SQL Editor.

### Étape 3: Tester
1. Accédez à: https://v0-supabase-patient-integrat-git-a9277c-bachs-projects-25b173f6.vercel.app
2. Allez sur un dossier patient avec documents
3. Cliquez sur "Télécharger"
4. Observez:
   - Le fichier se télécharge-t-il?
   - Y a-t-il des messages d'erreur?

## 📋 Informations Nécessaires

Pour identifier le problème exact, j'ai besoin de:

1. **Logs Console du Navigateur** (F12)
   - Ouvrez F12 → Console
   - Cliquez sur "Télécharger"
   - Copiez TOUS les messages

2. **Message d'erreur exact**
   - Toast affiché à l'utilisateur
   - Message d'erreur dans la console

3. **Comportement du bouton**
   - Le bouton "Télécharger" est-il visible?
   - Est-il cliquable?
   - Qu'est-ce qui se passe au clic?

4. **Vérification Supabase Dashboard**
   - Les fichiers sont-ils visibles dans Storage → patient-documents?
   - Pouvez-vous télécharger manuellement depuis le Dashboard?

## 🔄 Déploiement Actuel

- **URL Application**: https://v0-supabase-patient-integrat-git-a9277c-bachs-projects-25b173f6.vercel.app
- **Code de téléchargement**: ✅ Fonctionnel et déployé
- **Problème**: Probablement lié aux **permissions Supabase Storage**

## 📝 Recommandation Finale

**Action prioritaire**: Appliquer les politiques RLS dans Supabase (Solution 3: Script SQL Complet).

Si le problème persiste après l'application des politiques:
1. Partagez les logs console du navigateur
2. Indiquez le message d'erreur exact
3. Confirmez si les fichiers sont visibles dans Supabase Dashboard Storage

---

**Date**: 2025-12-14  
**Commit**: Actuel  
**Statut**: En attente de diagnostic utilisateur et application des politiques RLS Supabase
