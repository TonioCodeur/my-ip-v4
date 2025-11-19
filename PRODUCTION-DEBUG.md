# Guide de débogage en production

## ✅ Problème résolu en DEV

L'IP publique réelle est maintenant détectée via `api.ipify.org` quand aucun header n'est disponible.

**Test réussi** : Votre IP `92.135.20.92` (Toulouse, France) est correctement détectée et stockée en DB.

---

## 🔍 Diagnostic du problème en PRODUCTION (Vercel)

### Causes possibles

1. **DATABASE_URL manquante ou incorrecte**
   - Vercel doit avoir la variable d'environnement `DATABASE_URL` configurée
   - Vérifier dans : Vercel Dashboard → Project → Settings → Environment Variables

2. **Prisma Client non généré**
   - Vercel doit build avec Prisma
   - Vérifier que `prisma generate` est appelé pendant le build

3. **Timeouts des Server Actions**
   - Les Server Actions ont un timeout par défaut de 10s
   - L'appel à `ip-api.com` peut échouer

4. **Logs non visibles**
   - Les `console.log` sont dans les logs Vercel
   - Accès via : Vercel Dashboard → Project → Deployments → [Latest] → Runtime Logs

---

## 🛠️ Comment vérifier

### 1. Vérifier les variables d'environnement Vercel

```bash
# Se connecter à Vercel CLI
npx vercel login

# Lister les variables d'environnement
npx vercel env ls

# Ajouter DATABASE_URL si manquante
npx vercel env add DATABASE_URL
```

### 2. Vérifier le build Vercel

Regarder dans `package.json` :

```json
{
  "scripts": {
    "build": "prisma generate && next build --turbopack",
    "postinstall": "prisma generate"
  }
}
```

### 3. Vérifier les logs en temps réel

```bash
# Déployer et suivre les logs
npx vercel --prod --logs
```

### 4. Tester l'app en production

Une fois déployée, ouvrir la page et vérifier :

```bash
# Dans Vercel Dashboard → Runtime Logs, chercher :
[getUserIp] Détection de l'IP utilisateur...
[getUserIp] ✅ IP détectée via x-forwarded-for: XXX.XXX.XXX.XXX
[saveIpInfo] Démarrage - IP reçue: XXX.XXX.XXX.XXX
[saveIpInfo] ✅ Record créé avec succès
```

### 5. Vérifier la base de données

```bash
# Depuis votre machine locale
npm run db:test

# Ou avec un script
npx tsx scripts/show-db-stats.ts
```

---

## ✅ Checklist production

- [ ] `DATABASE_URL` configurée dans Vercel
- [ ] `prisma generate` dans le script de build
- [ ] Déploiement réussi sans erreurs
- [ ] Logs montrent la détection d'IP
- [ ] Logs montrent la sauvegarde en DB
- [ ] Vérification DB montre les nouveaux enregistrements

---

## 🔧 Script de test production

Créé un endpoint API de test : `/api/test-db`

```typescript
// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { getUserIp } from '@/lib/get-user-ip';
import { saveIpInfo } from '@/actions/save-ip-info';

export async function GET() {
  try {
    const ip = await getUserIp();
    const result = await saveIpInfo(ip || undefined);

    return NextResponse.json({
      success: true,
      ip,
      result,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
```

Tester avec : `https://votre-app.vercel.app/api/test-db`

---

## 📊 État actuel

### Développement (LOCAL)
✅ IP détectée : `92.135.20.92` (Toulouse, France)
✅ Stockée en DB : OUI
✅ Géolocalisation : Correcte

### Production (VERCEL)
❓ À vérifier via les logs Vercel
❓ `DATABASE_URL` configurée ?
❓ Prisma client généré ?

---

## 🚀 Prochaines étapes

1. Vérifier `DATABASE_URL` dans Vercel
2. Vérifier le build sur Vercel
3. Déployer et consulter les Runtime Logs
4. Vérifier la DB après quelques visites
5. Si problème persiste, utiliser l'endpoint `/api/test-db` pour debug
