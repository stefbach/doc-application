# 🔧 Fix Erreur 400 - Déploiement Vercel Réussi

## ✅ BONNE NOUVELLE

Le build Vercel a **RÉUSSI** ! L'application est déployée.

L'erreur 400 est un problème de **configuration**, pas de code.

---

## 🔍 DIAGNOSTIC DE L'ERREUR 400

### Causes Possibles

1. **Variables d'environnement Supabase manquantes ou incorrectes** (Probabilité : 🔴 HAUTE)
   - `NEXT_PUBLIC_SUPABASE_URL` manquant ou invalide
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` manquant ou invalide
   - `SUPABASE_SERVICE_ROLE_KEY` manquant (optionnel selon les fonctionnalités)

2. **CORS Supabase non configuré** (Probabilité : 🟡 MOYENNE)
   - L'URL Vercel n'est pas autorisée dans Supabase
   - Besoin d'ajouter `*.vercel.app` aux URLs autorisées

3. **Politique RLS (Row Level Security) Supabase** (Probabilité : 🟡 MOYENNE)
   - Les politiques de sécurité empêchent l'accès anonyme
   - Besoin d'authentification pour accéder aux données

4. **URL de redirection incorrecte** (Probabilité : 🟢 FAIBLE)
   - Callback URL d'authentification non configurée

---

## ✅ SOLUTION 1 : Vérifier Variables d'Environnement

### Sur Vercel

1. **Aller sur le projet Vercel**
   - https://vercel.com/[votre-compte]/[nom-projet]/settings/environment-variables

2. **Vérifier ces 3 variables** :

```
NEXT_PUBLIC_SUPABASE_URL=https://[votre-projet].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (optionnel)
```

3. **Si manquantes ou incorrectes** :
   - Aller sur Supabase : https://supabase.com/dashboard/project/[votre-projet]/settings/api
   - Copier les valeurs **exactes**
   - Les coller dans Vercel
   - **IMPORTANT** : Sélectionner "Production, Preview, Development" pour chaque variable
   - Sauvegarder

4. **Redéployer** :
   - Deployments → Dernier déploiement
   - Bouton "Redeploy"
   - Confirmer

---

## ✅ SOLUTION 2 : Configurer CORS dans Supabase

### Sur Supabase Dashboard

1. **Aller sur Supabase** : https://supabase.com/dashboard/project/[votre-projet]/auth/url-configuration

2. **Site URL** :
   - Ajouter l'URL de production Vercel
   - Exemple : `https://v0-supabase-patient-5xdmi.vercel.app`

3. **Redirect URLs** :
   - Ajouter ces URLs :
   ```
   https://v0-supabase-patient-5xdmi.vercel.app/**
   https://v0-supabase-patient-5xdmi.vercel.app/auth/callback
   http://localhost:3000/**
   ```

4. **Sauvegarder**

---

## ✅ SOLUTION 3 : Vérifier Politiques RLS Supabase

### Sur Supabase Dashboard

1. **Aller sur** : https://supabase.com/dashboard/project/[votre-projet]/auth/policies

2. **Vérifier les tables** :
   - `patients` : Doit avoir une politique permettant l'accès aux utilisateurs authentifiés
   - `documents` : Pareil
   - `patient_lists` : Pareil

3. **Exemple de politique RLS** :
```sql
-- Permettre SELECT pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can read patients"
ON patients
FOR SELECT
TO authenticated
USING (true);

-- Permettre INSERT pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can insert patients"
ON patients
FOR INSERT
TO authenticated
WITH CHECK (true);
```

4. **Si les politiques sont trop restrictives** :
   - Modifier pour permettre l'accès
   - Ou désactiver temporairement RLS (non recommandé en production)

---

## 🔍 DIAGNOSTIC DÉTAILLÉ

### Ouvrir la Console du Navigateur

1. **Ouvrir l'application Vercel** : https://v0-supabase-patient-5xdmi.vercel.app

2. **Ouvrir DevTools** :
   - Chrome/Edge : `F12` ou `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox : `F12`

3. **Onglet "Console"** :
   - Chercher les erreurs en rouge
   - Noter les messages d'erreur exacts

4. **Onglet "Network"** :
   - Rafraîchir la page (`F5`)
   - Chercher les requêtes en rouge (status 400, 401, 403)
   - Cliquer dessus
   - Onglet "Response" → Noter le message d'erreur

5. **Partager les informations** :
   - Message d'erreur de la console
   - URL de la requête qui échoue
   - Corps de la réponse (Response)

---

## 🛠️ VÉRIFICATION RAPIDE

### Checklist de Configuration

```bash
# Variables d'environnement Vercel
[ ] NEXT_PUBLIC_SUPABASE_URL définie
[ ] NEXT_PUBLIC_SUPABASE_ANON_KEY définie
[ ] Variables appliquées à "Production, Preview, Development"

# Supabase CORS
[ ] Site URL configurée avec l'URL Vercel
[ ] Redirect URLs configurées
[ ] Wildcards ajoutés (*.vercel.app)

# Supabase RLS
[ ] Politiques permettent l'accès aux utilisateurs authentifiés
[ ] Pas de politiques trop restrictives

# Authentification
[ ] Page de login accessible (/login)
[ ] Pas d'erreur 404 sur /auth/callback
```

---

## 🎯 SCÉNARIOS COURANTS

### Scénario 1 : Erreur "Invalid API Key"

**Cause** : `NEXT_PUBLIC_SUPABASE_ANON_KEY` incorrecte

**Solution** :
1. Supabase → Settings → API
2. Copier **anon** **public** key (pas la service_role)
3. Vercel → Environment Variables → Mettre à jour
4. Redéployer

### Scénario 2 : Erreur "CORS policy"

**Cause** : URL Vercel non autorisée dans Supabase

**Solution** :
1. Supabase → Authentication → URL Configuration
2. Ajouter `https://v0-supabase-patient-5xdmi.vercel.app`
3. Ajouter wildcard `https://*.vercel.app/**`

### Scénario 3 : Erreur "Unauthorized" (401)

**Cause** : Politiques RLS trop restrictives

**Solution** :
1. Supabase → Authentication → Policies
2. Vérifier que les politiques permettent SELECT pour authenticated users
3. Ou modifier pour être plus permissives

### Scénario 4 : Page blanche sans erreur

**Cause** : Redirection infinie ou variable manquante

**Solution** :
1. Vérifier la console du navigateur
2. Vérifier que toutes les variables d'environnement sont définies
3. Vérifier les redirections dans le code

---

## 📞 BESOIN D'AIDE ?

### Informations à Fournir

Pour un diagnostic précis, partagez :

1. **Console Browser** :
   - Ouvrir DevTools (F12)
   - Copier toutes les erreurs de la console (texte ou screenshot)

2. **Network Tab** :
   - Requêtes en erreur (status 400, 401, 403, 404)
   - URL de la requête
   - Corps de la réponse

3. **Variables Vercel** :
   - Liste des variables définies (sans les valeurs)
   - Exemple : "J'ai NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY"

4. **Configuration Supabase** :
   - Site URL configurée
   - Redirect URLs configurées
   - RLS activé ou non

---

## ✅ APRÈS LE FIX

### Test de l'Application

1. **Page d'accueil** `/` :
   - Devrait rediriger vers `/login` si non authentifié
   - Ou vers `/dashboard` si authentifié

2. **Page de login** `/login` :
   - Formulaire visible
   - Pas d'erreur de connexion Supabase

3. **Après connexion** `/dashboard` :
   - Statistiques visibles
   - Pas d'erreur 400

4. **Recherche patients** `/dashboard/patients` :
   - Recherche fonctionne
   - Résultats s'affichent

---

## 🎉 RÉSULTAT ATTENDU

Après configuration correcte :

- ✅ Application accessible sans erreur 400
- ✅ Page de login fonctionnelle
- ✅ Dashboard avec statistiques
- ✅ Toutes les fonctionnalités opérationnelles

---

**URL Application** : https://v0-supabase-patient-5xdmi.vercel.app  
**Status Build** : ✅ Réussi  
**Status Config** : ⚠️ À vérifier/corriger  
**Prochaine étape** : Vérifier variables d'environnement + CORS Supabase
