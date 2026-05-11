# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 IP address analyzer application with internationalization support (English/French). Users can look up their own IP or search for any IP address to get geolocation data and ISP information. The app includes IP search history tracking and live statistics.

## Common Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Build & Deploy
npm run build            # Production build (Prisma generate + Next.js build)
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint

# Database
npm run db:test          # Test database connection (uses tsx)
npx prisma migrate dev   # Run migrations in development
npx prisma migrate deploy # Run migrations in production
```

## Architecture

### Internationalization (i18n)
- Uses `next-international` for i18n with middleware-based routing
- **Middleware**: [middleware.ts](middleware.ts) intercepts all routes (except `/api`, static files) to handle locale routing
- **Locale routing**: All pages are under `/[locale]` dynamic segment supporting `en` and `fr`
- **Server translations**: Use `getI18n()` from [locales/server.ts](locales/server.ts) in Server Components
- **Client translations**: Use `useI18n()` hook from [locales/client.ts](locales/client.ts) in Client Components
- **Translation files**: [locales/en.ts](locales/en.ts) and [locales/fr.ts](locales/fr.ts) export const objects

### Layout Structure
The app has a dual-layout approach:
1. **Root layout** ([src/app/layout.tsx](src/app/layout.tsx)): Handles theme provider and global styling
2. **Locale layout** ([src/app/[locale]/layout.tsx](src/app/[locale]/layout.tsx)): Wraps children with `I18nProviderClient` and `QueryProvider` for React Query

### Data Fetching & State Management
- **React Query** (`@tanstack/react-query`) for server state caching and real-time synchronization
- **IP Info Hook**: [src/hooks/use-ip-info.ts](src/hooks/use-ip-info.ts) fetches IP data with 5-minute stale time and 10-minute garbage collection
- **API Routes**:
  - [src/app/api/ip-info/route.ts](src/app/api/ip-info/route.ts): Proxies requests to ip-api.com with 1-hour cache
    - Accepts optional `?ip=` query param
    - Falls back to user's IP from headers (`x-forwarded-for`, `x-real-ip`, `x-remote-addr`)
    - Uses test IP `92.135.20.92` in development mode
  - [src/app/api/stats/route.ts](src/app/api/stats/route.ts): Returns real-time statistics from database
    - Cached for 30 seconds with stale-while-revalidate
    - Comprehensive Prisma error handling (connection timeouts, pooling issues)

### Component Architecture
The main page uses a container/presenter pattern:
- **IpDashboard** ([src/components/ip-dashboard.tsx](src/components/ip-dashboard.tsx)): Container component managing state for current/searched IP
  - Orchestrates: IpStats, IpInput, IpHistory, and IpInfo components
- **IpHistory** ([src/components/ip-history.tsx](src/components/ip-history.tsx)): Client-side localStorage-based search history (max 10 items)
- **IpStats** ([src/components/ip-stats.tsx](src/components/ip-stats.tsx)): Live statistics component displaying real-time data from database
  - Auto-refreshes every 30 seconds
  - Invalidates cache automatically after new IP searches
  - Fetches data from `/api/stats` endpoint
- **IpInfo** ([src/components/ip-info.tsx](src/components/ip-info.tsx)): Displays IP geolocation data
  - Automatically saves IP data to database after successful fetch
  - Triggers stats refresh via React Query cache invalidation
  - Prevents duplicate saves (24-hour deduplication window)

### Database (Prisma)
- **Schema**: [prisma/schema.prisma](prisma/schema.prisma) defines `User` model with IP geolocation fields
- **Custom output**: Prisma client generated to `src/generated/prisma` (not default location)
- **Database**: PostgreSQL with connection pooling support
  - `DATABASE_URL`: Connection with pooler (e.g., Supabase pooler on port 6543)
  - `DIRECT_DATABASE_URL`: Direct connection for migrations (port 5432)
- **Vercel optimization**: Connection pooling configured to avoid "too many connections" in serverless
- **Server Actions**:
  - [src/actions/save-ip-info.ts](src/actions/save-ip-info.ts): Saves IP geolocation data to database with 24-hour deduplication
  - [src/actions/get-ip-stats.ts](src/actions/get-ip-stats.ts): Aggregates statistics (total queries, unique countries, active users)

### Styling
- **Tailwind CSS v4** with custom configuration
- **shadcn/ui components** in [src/components/ui/](src/components/ui/)
- **Theme switching**: Uses `next-themes` with custom ModeToggle component (fixed position top-right)

### IP Detection
Server-side IP detection happens in two places:
1. [src/lib/get-user-ip.ts](src/lib/get-user-ip.ts): Used in page.tsx to get initial IP on SSR
2. [src/app/api/ip-info/route.ts](src/app/api/ip-info/route.ts): Used when no IP param provided to API

Both check headers in order: `x-forwarded-for` → `x-real-ip` → `x-remote-addr`

## Important Notes

- **Turbopack**: Dev uses Turbopack (`--turbopack` flag), production build uses standard Next.js (Vercel compatible)
- **React 19**: Using latest React version (19.1.0)
- **Locale handling**: Always await `params` in page/layout components (Next.js 15 async params pattern)
- **History persistence**: IP search history uses localStorage, not database
- **Real-time stats synchronization**:
  - IpInfo component automatically saves searches to database
  - React Query cache invalidation triggers immediate stats refresh
  - 24-hour deduplication prevents redundant database entries
  - Stats auto-refresh every 30 seconds and on window focus

## Vercel Deployment

### Environment Variables
Configure these in Vercel dashboard (Settings → Environment Variables):

```bash
# Database avec connection pooling (Supabase/Neon/PlanetScale)
DATABASE_URL=postgresql://user:password@host:6543/database?pgbouncer=true

# URL directe pour migrations
DIRECT_DATABASE_URL=postgresql://user:password@host:5432/database
```

### Deployment Steps
1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Configure environment variables
4. Vercel will automatically:
   - Run `npm install`
   - Run `prisma generate` (postinstall hook)
   - Run `next build`
   - Deploy to Edge Network

### Post-Deployment
- Run migrations: Use Vercel CLI or direct database access
  ```bash
  # Via Vercel CLI (recommended)
  vercel env pull .env.production
  npx prisma migrate deploy
  ```

### Performance Optimizations
- **Region**: Configured to `cdg1` (Paris) in [vercel.json](vercel.json)
- **API timeout**: 10 seconds max for API routes
- **Caching**: API responses cached for 1 hour with stale-while-revalidate
- **Connection pooling**: Prisma configured for serverless environments
