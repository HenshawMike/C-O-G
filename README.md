# Chapel of Glory — Arthur Jarvis University

Official web application for **Chapel of Glory, Arthur Jarvis University**, built with React, TypeScript, Tailwind CSS, and an Express REST API with persistent storage, image uploads, and role-based Admin Dashboard authentication.

## Quick Start (pnpm)

```bash
pnpm install
pnpm dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:4000`
- **Admin Dashboard**: `http://localhost:5173/portal-cog-7x9k2m4v` (customizable via `VITE_ADMIN_PATH` in `.env`)

### Production Build & Run

```bash
pnpm build
pnpm start
```

## Seeded Admin Credentials

- **Super Admin**: `admin@chapelofglory.org` / `ChapelAdmin@2026`
- **Editor**: `media@chapelofglory.org` / `ChapelMedia@2026`

## Supabase Production Schema

A ready-to-run PostgreSQL + Row Level Security migration is included in `supabase/schema.sql`.
