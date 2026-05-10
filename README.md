# ✈ TravelLoop

> **AI-powered travel planning with an interactive 3D globe, smart itineraries, and a dark-luxury glassmorphism UI.**

<div align="center">

![TravelLoop](https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=400&fit=crop&q=80)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=flat-square&logo=threedotjs)](https://threejs.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Screen Map](#screen-map)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deploy](#deploy)
- [Project Structure](#project-structure)

---

## Overview

TravelLoop is a full-stack hackathon travel planning web app. Users plan trips on a live 3D Earth globe, auto-generate itineraries by selecting region + budget + interests, build day-by-day schedules with drag-and-drop stops, track spending with a 3D donut budget chart, and share read-only public itineraries.

```
Plan → Build → Budget → Share
  ↓        ↓       ↓       ↓
Globe   Routes  Donut   Token
Hero    + DnD   Chart   Link
```

---

## Features

| Feature | Description |
|---------|-------------|
| 🌍 **3D Globe** | Real Earth texture (NASA Blue Marble), animated flight arcs, numbered stop pins |
| ✈ **Animated Routes** | Dashed arc paths with 3D airplane mesh flying between cities |
| 🤖 **Smart Planner** | Auto-generate full itinerary from region + duration + budget + interests |
| 🗺 **Route Builder** | Departure → mid stops → destination → optional return trip |
| 💰 **Budget Tracker** | 3D donut chart, auto-split (Transport 25% · Stay 35% · Food 20% · Activities 15%) |
| 📋 **Drag & Drop** | Reorder itinerary stops with dnd-kit, real-time Supabase sync |
| 🎉 **Confetti Checklist** | Packing list with canvas-confetti on 100% completion |
| 🌙 **Dark / Light Theme** | Full palette switch via CSS custom properties |
| 🔗 **Public Share** | Read-only trip link via share token, no auth required |
| 🛡 **Row-Level Security** | Supabase RLS — users only access their own data |
| 📊 **Admin Dashboard** | KPI cards, 3D bar chart, activity heatmap, user table |

---

## Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                        Frontend                         │
│                                                         │
│  React 18 + Vite + TypeScript                           │
│  ├── @react-three/fiber + drei  ← 3D Globe / Charts     │
│  ├── Framer Motion              ← Animations            │
│  ├── @dnd-kit/core              ← Drag & Drop           │
│  ├── React Hook Form + Zod      ← Forms & Validation    │
│  ├── Zustand                    ← Global State          │
│  ├── TailwindCSS + CSS Vars     ← Styling               │
│  ├── Lucide React               ← Icons                 │
│  ├── react-hot-toast            ← Notifications         │
│  └── canvas-confetti            ← Checklist Celebration │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                        Backend                          │
│                                                         │
│  Supabase (PostgreSQL)                                  │
│  ├── Auth (email/password + email confirmation)         │
│  ├── Row Level Security on all user tables              │
│  ├── 9 tables + FK constraints                          │
│  └── Seed: 22 cities · 110+ activities                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                        Deploy                           │
│                                                         │
│  Vercel (SPA rewrite in vercel.json)                    │
└─────────────────────────────────────────────────────────┘
```

---

## Architecture

The codebase follows **Layered C** — thin route shells in `pages/`, shared atoms in `components/`, domain features in `features/`, side-effect hooks in `hooks/`, global state in `store/`, and infrastructure in `lib/`.

```
src/
├── pages/           ← 14 thin route shells (one per screen)
├── components/      ← Shared atoms: NavBar, TiltCard, Modal, Skeleton…
├── features/
│   ├── globe/       ← Globe.tsx (R3F), ArcPath.tsx
│   ├── particles/   ← ParticleField.tsx (Auth left panel)
│   ├── budget/      ← BudgetDonut.tsx (R3F torus)
│   ├── admin/       ← BarChart3D.tsx (R3F boxes)
│   └── itinerary/   ← StopList.tsx (dnd-kit), DayTimeline.tsx
├── hooks/           ← useAuth, useTrips, useCities, useActivities, useTheme
├── store/           ← authStore, tripsStore, uiStore (Zustand)
└── lib/
    ├── supabase.ts  ← Client singleton + full Database type
    └── schemas.ts   ← Zod schemas for all forms
```

---

## Database Schema

```
┌──────────────┐       ┌──────────────┐       ┌───────────────┐
│    users     │       │    trips     │       │     stops     │
│──────────────│       │──────────────│       │───────────────│
│ id (uuid) PK │──┐    │ id (uuid) PK │──┐    │ id (uuid) PK  │
│ email        │  └───►│ user_id  FK  │  └───►│ trip_id FK    │
│ name         │       │ name         │       │ city_id FK    │
│ avatar_url   │       │ description  │       │ position_order│
│ language     │       │ cover_photo  │       │ start_date    │
│ currency     │       │ start_date   │       │ end_date      │
└──────────────┘       │ end_date     │       └───────┬───────┘
                       │ total_budget │               │
                       │ is_public    │       ┌───────▼───────┐
                       │ share_token  │       │ stop_activities│
                       └──────┬───────┘       │───────────────│
                              │               │ stop_id FK    │
                       ┌──────▼──────┐        │ activity_id FK│
                       │   budgets   │        │ scheduled_time│
                       │─────────────│        │ cost_override │
                       │ trip_id FK  │        └───────────────┘
                       │ transport   │
                       │ stay        │       ┌───────────────┐
                       │ meals       │       │   activities  │
                       │ activities  │       │───────────────│
                       │ misc        │  ┌───►│ id (uuid) PK  │
                       │ total_limit │  │    │ city_id FK    │
                       └─────────────┘  │    │ name          │
                                        │    │ category      │
┌──────────────┐       ┌────────────┐   │    │ cost_estimate │
│ checklist    │       │   cities   │───┘    │ duration_hours│
│──────────────│       │────────────│        └───────────────┘
│ trip_id FK   │       │ id PK      │
│ category     │       │ name       │       ┌───────────────┐
│ item_name    │       │ country    │       │  trip_notes   │
│ is_packed    │       │ region     │       │───────────────│
└──────────────┘       │ lat / lng  │       │ trip_id FK    │
                       │ cost_index │       │ stop_id FK    │
                       │ popularity │       │ content       │
                       └────────────┘       └───────────────┘
```

---

## Screen Map

```
/auth                 ← Login / Signup
│
└── / (Dashboard)
    ├── 3D Globe hero with trip pins + animated arcs
    ├── Recent trips horizontal scroll
    ├── Explore destinations grid
    └── [Smart Planner] [Plan New Trip]
        │
        ├── /trips/new          ← 4-step Create Trip wizard
        │   Step 1: Name + description
        │   Step 2: Route (departure → mid stops → destination → return)
        │   Step 3: Dates
        │   Step 4: Budget (auto-distributed)
        │
        ├── /trips              ← My Trips masonry grid
        │
        ├── /trips/:id          ← Trip Detail hub
        │   ├── /trips/:id/build    ← Itinerary Builder (3-panel)
        │   ├── /trips/:id/view     ← Itinerary View (timeline / map)
        │   ├── /trips/:id/budget   ← Budget (3D donut + breakdown)
        │   ├── /trips/:id/checklist← Packing Checklist (confetti)
        │   └── /trips/:id/notes   ← Trip Journal (auto-save)
        │
        ├── /cities             ← City Search (3D flip cards)
        ├── /activities         ← Activity Search (filter sidebar)
        ├── /profile            ← User Profile / Settings
        └── /admin              ← Admin Dashboard

/share/:token         ← Public read-only itinerary (no auth)
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

### 1. Clone & Install

```bash
git clone https://github.com/Adgu0205/TravelLoop.git
cd TravelLoop
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
# Fill in your Supabase URL and anon key
```

`.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Migrations

Open your Supabase project → **SQL Editor** and run:

1. `supabase/schema.sql` — creates all 9 tables with RLS policies
2. `supabase/seed.sql` — inserts 22 cities + 110+ activities

Or use the Node.js runner (requires direct DB connection):

```bash
# Add DB connection string to .env.local:
# SUPABASE_DB_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
node supabase/run-sql.mjs
```

### 4. Create Test Users (optional)

```bash
node supabase/create-users.mjs
# Creates: user@traveloop.com / Traveloop@123
#          admin@traveloop.com / Admin@1234
```

### 5. Start Dev Server

```bash
npm run dev
# → http://localhost:5173
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | ✅ |

> **Note:** Never commit `.env.local` — it's in `.gitignore`.

---

## Deploy

### Vercel (recommended)

```bash
npm install -g vercel
vercel login
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel --prod
```

The `vercel.json` SPA rewrite is already configured — all routes fall through to `index.html`.

### Manual Build

```bash
npm run build
# Output in dist/ — deploy to any static host
```

---

## Project Structure

```
TravelLoop/
├── public/
│   └── textures/           ← Earth texture maps (NASA Blue Marble)
│       ├── earth.jpg
│       ├── earth_normal.jpg
│       └── earth_clouds.png
├── src/
│   ├── App.tsx             ← Router + auth guards + lazy imports
│   ├── index.css           ← CSS variables (Nautical Gold palette) + globals
│   ├── components/
│   │   ├── NavBar.tsx
│   │   ├── TiltCard.tsx    ← 3D mouse-tilt card
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   ├── DatePicker.tsx  ← Custom calendar (no native inputs)
│   │   ├── CurrencyToggle.tsx
│   │   ├── ProgressBar.tsx
│   │   └── TripPlannerModal.tsx ← Smart Planner wizard
│   ├── features/
│   │   ├── globe/
│   │   │   ├── Globe.tsx   ← R3F earth + pins + animated arcs
│   │   │   └── ArcPath.tsx ← Standalone Bezier arc
│   │   ├── particles/
│   │   │   └── ParticleField.tsx ← Auth page star field
│   │   ├── budget/
│   │   │   └── BudgetDonut.tsx   ← R3F torus donut chart
│   │   ├── admin/
│   │   │   └── BarChart3D.tsx    ← R3F 3D bar chart
│   │   └── itinerary/
│   │       └── StopList.tsx      ← dnd-kit sortable stop list
│   ├── hooks/
│   │   ├── useAuth.ts      ← login / signup / logout / session listener
│   │   ├── useTrips.ts     ← CRUD + auto budget distribution
│   │   ├── useCities.ts    ← Search + filter cities
│   │   ├── useActivities.ts
│   │   └── useTheme.ts     ← Dark/light toggle + localStorage
│   ├── store/
│   │   ├── authStore.ts    ← Zustand: user session
│   │   ├── tripsStore.ts   ← Zustand: trips list
│   │   └── uiStore.ts      ← Zustand: modals / loading
│   ├── lib/
│   │   ├── supabase.ts     ← Client singleton + Database types
│   │   └── schemas.ts      ← Zod validation schemas
│   └── pages/              ← 14 route pages (all lazy-loaded)
├── supabase/
│   ├── schema.sql          ← Full DB schema + RLS policies
│   ├── seed.sql            ← 22 cities + 110+ activities
│   ├── run-sql.mjs         ← Node runner for migrations
│   └── create-users.mjs    ← Test user creation script
├── vercel.json             ← SPA rewrites + security headers
├── tailwind.config.ts
├── vite.config.ts
└── tsconfig.json
```

---

## Design System

**Palette: Nautical Gold**

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-deep` | `#061E29` | Page background |
| `--bg-mid` | `#0a2535` | Cards, panels, modals |
| `--bg-surface` | `#0f2d40` | Elevated surfaces, inputs |
| `--accent-teal` | `#1D546D` | Borders, hover states |
| `--accent-sage` | `#5F9598` | Muted accents, icons |
| `--accent-gold` | `#E0DDAA` | CTAs, highlights, active |
| `--text-primary` | `#EEEDDE` | Headings, body text |
| `--text-muted` | `#8a9aaa` | Subtitles, placeholders |

**Typography:** `Playfair Display` (headings) · `DM Sans` (body)

**Light theme** overrides all tokens to a warm cream palette (`#F9F5EF` background, `#C4862A` gold).

---

## Seeded Data

| Type | Count |
|------|-------|
| Cities | 22 (across Asia, Europe, Americas, Middle East, Africa, Oceania) |
| Activities per city | ~5 avg |
| Activity categories | culture, food, adventure, relaxation, shopping, nightlife, nature, wellness |
| Cost index range | 20–90 / 100 |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## License

MIT — free to use, modify, and distribute.

---

<div align="center">
  <p>Built with React + Three.js + Supabase</p>
  <p>
    <a href="https://github.com/Adgu0205/TravelLoop">GitHub</a>
  </p>
</div>
