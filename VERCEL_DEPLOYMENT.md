# Guide de Déploiement Vercel

Ce guide explique comment déployer l'application IP Analyzer sur Vercel en production.

## Prérequis

1. **Base de données PostgreSQL** avec connection pooling
   - ✅ Supabase (recommandé - gratuit avec pooling intégré)
   - ✅ Neon (connection pooling natif)
   - ✅ PlanetScale
   - ✅ Railway avec PgBouncer

2. **Compte Vercel** (gratuit ou pro)

## Configuration de la Base de Données

### Option 1: Supabase (Recommandé)

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Allez dans **Settings → Database**
3. Récupérez les URLs de connexion :
   - **Connection Pooling URL** (port 6543) → `DATABASE_URL`
   - **Direct Connection URL** (port 5432) → `DIRECT_DATABASE_URL`

```bash
# Exemple Supabase
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

### Option 2: Neon

1. Créez un projet sur [neon.tech](https://neon.tech)
2. Récupérez les URLs dans le dashboard
3. Neon utilise le pooling par défaut

```bash
DATABASE_URL=postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
DIRECT_DATABASE_URL=postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

## Déploiement sur Vercel

### Étape 1: Préparer le Repository

```bash
# Assurez-vous que tout est commité
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Étape 2: Importer dans Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New Project"**
3. Importez votre repository GitHub/GitLab/Bitbucket
4. Vercel détecte automatiquement Next.js

### Étape 3: Configurer les Variables d'Environnement

Dans **Settings → Environment Variables**, ajoutez :

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `DATABASE_URL` | URL avec pooling (port 6543) | Production, Preview, Development |
| `DIRECT_DATABASE_URL` | URL directe (port 5432) | Production, Preview, Development |

**Important**: Cochez toutes les cases (Production, Preview, Development)

### Étape 4: Déployer

1. Cliquez sur **"Deploy"**
2. Vercel va :
   - Installer les dépendances (`npm install`)
   - Générer Prisma client (`prisma generate`)
   - Builder l'application (`next build`)
   - Déployer sur le CDN

### Étape 5: Exécuter les Migrations

**Option A: Via Vercel CLI (Recommandé)**

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Lier le projet
vercel link

# Récupérer les variables d'env
vercel env pull .env.production

# Exécuter les migrations
npx prisma migrate deploy
```

**Option B: Depuis votre DB directement**

```bash
# Utiliser DIRECT_DATABASE_URL dans .env
DATABASE_URL="votre-direct-url"
npx prisma migrate deploy
```

## Vérification Post-Déploiement

### 1. Tester l'Application

Visitez votre URL Vercel (ex: `https://my-ip-v4.vercel.app`)

### 2. Vérifier les Logs

```bash
# Via Vercel CLI
vercel logs

# Ou dans le dashboard Vercel → Deployments → Votre déploiement → Runtime Logs
```

### 3. Tester la Détection IP

L'application devrait automatiquement détecter votre IP via les headers Vercel :
- `x-forwarded-for`
- `x-real-ip`
- `x-vercel-forwarded-for`

## Troubleshooting

### Erreur: "Too many database connections"

**Cause**: Pas de connection pooling configuré

**Solution**:
1. Vérifiez que `DATABASE_URL` pointe vers le pooler (port 6543 pour Supabase)
2. Ajoutez `?pgbouncer=true` ou `?connection_limit=1` à l'URL

### Erreur: "Prisma Client not initialized"

**Cause**: `prisma generate` pas exécuté

**Solution**:
1. Vérifiez que `postinstall` script est dans `package.json`
2. Re-déployez avec `vercel --prod`

### Erreur: "Cannot find module '@prisma/client'"

**Cause**: Prisma client généré dans un mauvais emplacement

**Solution**:
1. Vérifiez `prisma/schema.prisma` → `output = "../src/generated/prisma"`
2. Clear build cache dans Vercel: Settings → Clear Build Cache

### L'IP n'est pas détectée en production

**Vérification**:
1. Consultez les logs pour voir quels headers sont disponibles
2. Vérifiez que `getUserIp()` dans `src/lib/get-user-ip.ts` cherche `x-vercel-forwarded-for`

## Optimisations Production

### Cache Configuration

Le fichier `vercel.json` configure :
- Cache API : 1 heure avec revalidation
- Timeout API : 10 secondes max
- Région : Paris (CDG1) par défaut

### Performance

1. **Images**: Utilisez `next/image` pour l'optimisation automatique
2. **Fonts**: Next.js optimise automatiquement les fonts
3. **Bundle**: Analyse avec `ANALYZE=true npm run build`

## Domaine Personnalisé

1. Vercel Dashboard → Settings → Domains
2. Ajoutez votre domaine
3. Configurez les DNS selon les instructions

## Monitoring

1. **Analytics**: Activez Vercel Analytics (Settings → Analytics)
2. **Speed Insights**: Activez Web Vitals monitoring
3. **Logs**: Consultez Runtime Logs pour debug

## CI/CD

Vercel déploie automatiquement :
- **Production**: Chaque push sur `main`
- **Preview**: Chaque pull request

Pour désactiver les preview deployments :
```json
// vercel.json
{
  "github": {
    "silent": true,
    "autoJobCancelation": true
  }
}
```

## Support

- Documentation Vercel: [vercel.com/docs](https://vercel.com/docs)
- Documentation Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- Documentation Prisma: [prisma.io/docs](https://prisma.io/docs)
