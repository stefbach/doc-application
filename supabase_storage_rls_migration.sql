-- Migration pour les politiques RLS de Supabase Storage
-- Ce script configure les permissions pour le bucket 'patient-documents'
-- À exécuter dans Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql/new

-- ============================================================================
-- PARTIE 1: Vérification et création du bucket
-- ============================================================================

-- Vérifier que le bucket 'patient-documents' existe
-- Si absent, créez-le manuellement via Dashboard > Storage > New Bucket
SELECT 
  id, 
  name, 
  public,
  created_at 
FROM storage.buckets 
WHERE id = 'patient-documents';

-- Si le bucket n'existe pas, il faut le créer via l'interface Supabase Dashboard
-- ou avec la commande suivante (nécessite les bons privilèges):
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('patient-documents', 'patient-documents', false)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PARTIE 2: Suppression des anciennes politiques (nettoyage)
-- ============================================================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Authenticated users can download files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view files" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files" ON storage.objects;
DROP POLICY IF EXISTS "Public can download files" ON storage.objects;

-- ============================================================================
-- PARTIE 3: Création des nouvelles politiques RLS
-- ============================================================================

-- Politique 1: SELECT - Téléchargement de fichiers
-- Permet aux utilisateurs authentifiés de TÉLÉCHARGER (lire) tous les fichiers
-- du bucket 'patient-documents'
CREATE POLICY "Authenticated users can download files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'patient-documents');

-- Politique 2: INSERT - Upload de fichiers
-- Permet aux utilisateurs authentifiés d'UPLOADER de nouveaux fichiers
-- dans le bucket 'patient-documents'
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-documents');

-- Politique 3: UPDATE - Mise à jour de fichiers
-- Permet aux utilisateurs de MODIFIER leurs propres fichiers
-- (fichiers dans leur dossier user_id/...)
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'patient-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'patient-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique 4: DELETE - Suppression de fichiers
-- Permet aux utilisateurs de SUPPRIMER leurs propres fichiers
-- (fichiers dans leur dossier user_id/...)
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'patient-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- PARTIE 4: Configuration du bucket (optionnel)
-- ============================================================================

-- Option A: Bucket PRIVÉ avec RLS (RECOMMANDÉ pour la sécurité)
-- Les fichiers ne sont accessibles que via signed URLs générées côté serveur
-- Configuration par défaut si le bucket existe déjà

-- Option B: Bucket PUBLIC (Alternative simple, MOINS SÉCURISÉ)
-- Décommentez la ligne suivante pour rendre le bucket public
-- UPDATE storage.buckets SET public = true WHERE id = 'patient-documents';

-- ⚠️ Attention: Un bucket public permet l'accès direct à tous les fichiers
-- sans authentification via URL directe. Utilisez cette option uniquement
-- si vous êtes sûr de vos besoins de sécurité.

-- ============================================================================
-- PARTIE 5: Vérification des politiques appliquées
-- ============================================================================

-- Lister toutes les politiques actives pour storage.objects
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%patient-documents%' OR policyname LIKE '%Authenticated users%' OR policyname LIKE '%Users can%';

-- Vérifier la configuration du bucket
SELECT 
  id, 
  name, 
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets 
WHERE id = 'patient-documents';

-- ============================================================================
-- PARTIE 6: Tests de validation (optionnel)
-- ============================================================================

-- Test 1: Vérifier que l'utilisateur authentifié peut voir les fichiers
-- Exécutez cette requête en tant qu'utilisateur authentifié:
-- SELECT * FROM storage.objects 
-- WHERE bucket_id = 'patient-documents' 
-- LIMIT 5;

-- Test 2: Compter le nombre de fichiers dans le bucket
SELECT 
  COUNT(*) as total_files,
  SUM((metadata->>'size')::bigint) as total_size_bytes,
  ROUND(SUM((metadata->>'size')::bigint) / 1024.0 / 1024.0, 2) as total_size_mb
FROM storage.objects 
WHERE bucket_id = 'patient-documents';

-- ============================================================================
-- NOTES IMPORTANTES
-- ============================================================================

-- 1. Structure des chemins de fichiers:
--    Les fichiers sont organisés comme: user_id/patient_id/timestamp_filename
--    Exemple: "abc123.../def456.../1702567890_document.pdf"

-- 2. Signed URLs:
--    La fonction getSignedUrlForDownload() génère des URLs valides 5 minutes
--    Ces URLs permettent le téléchargement même avec un bucket privé

-- 3. Sécurité:
--    - SELECT: Tous les utilisateurs authentifiés peuvent télécharger (via signed URL)
--    - INSERT: Tous les utilisateurs authentifiés peuvent uploader
--    - UPDATE/DELETE: Uniquement le propriétaire (user_id dans le chemin)

-- 4. Dépannage:
--    Si les téléchargements échouent après cette migration:
--    a) Vérifiez les logs dans Supabase Dashboard > Logs
--    b) Testez l'accès manuel dans Storage > patient-documents
--    c) Vérifiez la console navigateur (F12) pour les erreurs JavaScript
--    d) Confirmez que auth.uid() retourne bien un UUID valide

-- 5. Alternative si les problèmes persistent:
--    Rendre le bucket public temporairement pour identifier la source:
--    UPDATE storage.buckets SET public = true WHERE id = 'patient-documents';
--    ⚠️ N'oubliez pas de le remettre en privé après le test!

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

-- Afficher un message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration des politiques RLS Storage terminée avec succès!';
  RAISE NOTICE 'Bucket: patient-documents';
  RAISE NOTICE 'Politiques: SELECT (tous auth), INSERT (tous auth), UPDATE/DELETE (owner only)';
  RAISE NOTICE 'Testez maintenant le téléchargement de documents depuis l''application.';
END $$;
