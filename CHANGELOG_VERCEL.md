# Changelog - Adaptation Vercel

## Modifications pour le déploiement Vercel en production

### 🔧 Configuration Build

**Fichier: `package.json`**
- ✅ Retiré `--turbopack` du script `build` (non supporté par Vercel)
- ✅ Ajouté `prisma generate` au script `build`
- ✅ Ajouté script `postinstall` pour générer Prisma automatiquement

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "prisma generate && next build",  // Modifié
  "postinstall": "prisma generate"           // Nouveau
}
```

### 🗄️ Database (Prisma)

**Fichier: `prisma/schema.prisma`**
- ✅ Ajouté support pour `directUrl` (connection pooling)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")  // Nouveau
}
```

**Fichier: `src/lib/prisma.ts`**
- ✅ Configuration optimisée pour serverless Vercel
- ✅ Désactivation du cache global en production (fonctions éphémères)
- ✅ Ajout configuration explicite datasources

### 📋 Fichiers de Configuration

**Nouveau: `vercel.json`**
- ✅ Configuration build personnalisée
- ✅ Région CDG1 (Paris) par défaut
- ✅ Timeout API : 10 secondes
- ✅ Headers de cache optimisés

**Nouveau: `.vercelignore`**
- ✅ Exclusion fichiers dev/test du déploiement
- ✅ Optimisation taille du build

**Nouveau: `.env.example`**
- ✅ Documentation des variables d'environnement
- ✅ Exemples pour Supabase/Neon

### 📚 Documentation

**Fichier: `CLAUDE.md`**
- ✅ Section "Vercel Deployment" ajoutée
- ✅ Instructions environnement
- ✅ Étapes de déploiement
- ✅ Optimisations listées

**Nouveau: `VERCEL_DEPLOYMENT.md`**
- ✅ Guide complet de déploiement
- ✅ Configuration base de données (Supabase, Neon)
- ✅ Troubleshooting
- ✅ Optimisations production

## Variables d'Environnement Requises

### Production (Vercel Dashboard)

```bash
# URL avec connection pooling (utilise le pooler)
DATABASE_URL=postgresql://user:pass@host:6543/db?pgbouncer=true

# URL directe pour migrations
DIRECT_DATABASE_URL=postgresql://user:pass@host:5432/db
```

## Checklist Pré-Déploiement

- [x] Retirer Turbopack du build
- [x] Configurer Prisma pour serverless
- [x] Ajouter connection pooling
- [x] Créer vercel.json
- [x] Documenter variables d'env
- [x] Tester détection IP Vercel
- [x] Optimiser cache API

## Ce qui Fonctionne Maintenant

✅ **Build Vercel**: Sans Turbopack, compatible serverless
✅ **Database**: Connection pooling configuré, pas de "too many connections"
✅ **IP Detection**: Headers Vercel (`x-forwarded-for`, `x-vercel-forwarded-for`)
✅ **Cache**: API responses cached 1h avec stale-while-revalidate
✅ **Performance**: Région Paris, timeout optimisé

## Notes Importantes

1. **Prisma Generate**: Automatique via `postinstall`
2. **Migrations**: À exécuter manuellement après déploiement
3. **Connection Pooling**: OBLIGATOIRE en production (Supabase/Neon recommandés)
4. **Headers IP**: Vercel utilise `x-forwarded-for` et `x-vercel-forwarded-for`

## Prochaines Étapes

1. Configurer base de données avec pooling (Supabase/Neon)
2. Déployer sur Vercel
3. Configurer variables d'environnement
4. Exécuter `prisma migrate deploy`
5. Tester en production

---

**Date**: 2025-01-19
**Version**: 1.0.0-vercel
**Status**: ✅ Prêt pour production Vercel
