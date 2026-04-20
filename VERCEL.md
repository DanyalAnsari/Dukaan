# Vercel Deployment Guide

## Quick Deploy

Click the button below to deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?repository-url=https://github.com/DanyalAnsari/Dukaan)

## Environment Variables

Set these in Vercel Project Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon recommended) |
| `BETTER_AUTH_SECRET` | Yes | Generate: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Yes | Your Vercel domain (e.g., `https://dukaan.vercel.app`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as BETTER_AUTH_URL |
| `NEXT_PUBLIC_API_URL` | Yes | `{APP_URL}/api` |

## Database Setup

### Option 1: Neon (Recommended for Vercel)

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. Add to environment variables

### Option 2: Vercel Postgres

1. Go to Vercel Dashboard → Storage → Create Database
2. Select PostgreSQL
3. Copy the connection string

## Deploy Steps

1. **Fork this repository** (or push to your GitHub)
2. **Import to Vercel**: `https://vercel.com/new/import`
3. **Configure**:
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
4. **Add Environment Variables**
5. **Deploy!**

## After First Deploy

Run database migrations:

```bash
# Using Vercel CLI
vercel env pull .env.local
pnpm db:migrate:prod
```

Or use the Vercel Dashboard Storage → migrations panel.

## Troubleshooting

### "Missing Environment Variable"
- Ensure all 5 environment variables are set in Vercel

### "Database connection failed"
- Check DATABASE_URL is correct
- Ensure IP allowlist includes Vercel's IPs (Neon: no config needed)

### "Auth errors"
- Verify BETTER_AUTH_URL matches your Vercel domain exactly
- Include protocol (https://)

### Build fails
- Run `pnpm typecheck` locally to verify no TypeScript errors
- Ensure all dependencies are in package.json