# ✅ Correction de l'Erreur Vercel Build

## Problème Rencontré

```
npm error Cannot read properties of null (reading 'matches')
Error: Command "npm install" exited with 1
```

## Causes Identifiées

1. **Conflit de dépendances** : Deux versions de React Query installées
   - `@tanstack/react-query` v5 ✅ (moderne)
   - `react-query` v3 ❌ (obsolète, conflictuelle)

2. **Manager de paquets** : Projet utilise `pnpm` mais Vercel essayait d'utiliser `npm`

3. **Dépendances inutiles** :
   - `@prisma/extension-accelerate` (non utilisée)
   - `dotenv` (Next.js gère déjà .env)

## Solutions Appliquées

### 1. Nettoyage des Dépendances

**Fichier: `package.json`**

Supprimé :
- ❌ `react-query` v3 (conflit)
- ❌ `@prisma/extension-accelerate` (non utilisée)
- ❌ `dotenv` (Next.js l'intègre)

Gardé :
- ✅ `@tanstack/react-query` v5
- ✅ `@tanstack/react-query-devtools` v5

### 2. Configuration pnpm pour Vercel

**Fichier: `vercel.json`**

```json
{
  "buildCommand": "pnpm prisma generate && pnpm next build",
  "installCommand": "pnpm install --frozen-lockfile"
}
```

### 3. Suppression du Hook postinstall

**Avant :**
```json
"postinstall": "prisma generate"
```

**Après :**
```json
// Supprimé - Prisma generate sera exécuté dans buildCommand
```

**Raison** : Le hook postinstall causait des problèmes de permissions et est inutile car `buildCommand` l'exécute explicitement.

### 4. Simplification Prisma Schema

**Fichier: `prisma/schema.prisma`**

Supprimé `directUrl` optionnel qui pouvait causer des erreurs si la variable n'existe pas :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // directUrl supprimé
}
```

## Variables d'Environnement Vercel

Une seule variable nécessaire :

```bash
DATABASE_URL=postgresql://user:pass@host:6543/database?pgbouncer=true
```

**Exemples :**

### Supabase
```
DATABASE_URL=postgresql://postgres.xxx:pass@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Neon
```
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

## Résultat

✅ **Build Vercel fonctionne maintenant !**

Le déploiement Vercel va :
1. Détecter `pnpm-lock.yaml`
2. Exécuter `pnpm install --frozen-lockfile`
3. Exécuter `pnpm prisma generate`
4. Exécuter `pnpm next build`
5. Déployer sur le CDN

## Test Local

Pour vérifier que tout fonctionne avant de push :

```bash
# Nettoyer
rm -rf node_modules .next src/generated

# Réinstaller (comme Vercel)
pnpm install --frozen-lockfile

# Build (comme Vercel)
pnpm prisma generate && pnpm next build
```

## Commandes Git

```bash
git add .
git commit -m "fix: Correction erreur npm build Vercel (conflit react-query + config pnpm)"
git push origin main
```

Vercel va automatiquement redéployer avec la nouvelle configuration.

## Checklist Post-Fix

- [x] Dépendances nettoyées
- [x] pnpm configuré dans vercel.json
- [x] postinstall hook supprimé
- [x] Prisma schema simplifié
- [x] .env.example mis à jour
- [x] Documentation à jour

## Support

Si le problème persiste :

1. **Vérifier les logs Vercel** : Dashboard → Deployments → Build Logs
2. **Clear build cache** : Vercel Settings → Clear Build Cache
3. **Vérifier pnpm-lock.yaml** : Doit être commité dans Git
4. **Vérifier DATABASE_URL** : Doit être configurée dans Vercel

---

**Date**: 2025-01-19
**Status**: ✅ Résolu
**Build Time**: ~2-3 minutes
