# MealSnap — Deployment Guide

## Prerequisites
- Node.js 20+
- A Vercel account
- A Google Cloud account
- An Anthropic API key

---

## Step 1 — Google OAuth Setup

1. Go to https://console.cloud.google.com
2. Create a new project → "MealSnap"
3. Enable **Google+ API** (or People API)
4. Go to **Credentials** → Create **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-app.vercel.app/api/auth/callback/google` (prod)
7. Copy **Client ID** and **Client Secret**

---

## Step 2 — Deploy to Vercel

```bash
npm install -g vercel
cd mealsnap
vercel
```

Follow prompts to link/create a project.

---

## Step 3 — Add Vercel Postgres

1. In Vercel dashboard → your project → **Storage** tab
2. Click **Create Database** → **Postgres**
3. Name it `mealsnap-db` → Create
4. Click **Connect** to your project
5. Vercel auto-injects all `POSTGRES_*` env vars

---

## Step 4 — Add Vercel Blob

1. In Vercel dashboard → **Storage** tab
2. Click **Create Database** → **Blob**
3. Name it `mealsnap-blob` → Create
4. Click **Connect** to your project
5. Vercel auto-injects `BLOB_READ_WRITE_TOKEN`

---

## Step 5 — Set Environment Variables

In Vercel dashboard → Project → **Settings** → **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `GOOGLE_CLIENT_ID` | From Step 1 |
| `GOOGLE_CLIENT_SECRET` | From Step 1 |
| `ANTHROPIC_API_KEY` | From console.anthropic.com |
| `MIGRATION_SECRET` | Any random string |

---

## Step 6 — Run Database Migration

After first deploy, run the migration once:

```bash
curl -X POST https://your-app.vercel.app/api/migrate?secret=YOUR_MIGRATION_SECRET
```

Expected response: `{"ok":true,"message":"Tables created"}`

---

## Step 7 — Local Development

```bash
cp .env.example .env.local
# Fill in all values in .env.local

npm install
npm run dev
# Open http://localhost:3000
```

---

## Architecture Summary

```
Vercel (hosting + serverless functions)
    ├── Next.js 15 App Router
    ├── NextAuth.js (Google OAuth)
    ├── Vercel Postgres (user data, meals, food items)
    ├── Vercel Blob (meal photos)
    └── Claude claude-sonnet-4-6 Vision API (AI food recognition)
```
