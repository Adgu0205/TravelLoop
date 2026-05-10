# Traveloop — Claude Project Context

## Project
Hackathon travel planning app. 14 screens, 3D globe centerpiece, dark-luxury glassmorphism UI.

## Stack
React 18 + Vite + TypeScript + Three.js (R3F/Drei) + TailwindCSS + Framer Motion + Supabase + Zustand + React Router v6

## Design
**Palette: Nautical Gold**
- `--bg-deep: #061E29` — page background
- `--bg-mid: #0a2535` — cards/panels
- `--accent-teal: #1D546D` — borders/hover
- `--accent-gold: #E0DDAA` — CTAs/highlights
- `--text-primary: #EEEDDE` — headings
- `--text-muted: #8a9aaa` — subtitles
- Typography: Playfair Display (headings) + DM Sans (body)

## Supabase
- Project ref: yvvxwwturdyknqkcxbir
- URL in .env.local

## Architecture: Layered C
```
src/
  pages/        ← 14 thin route shells
  components/   ← shared atoms (NavBar, TiltCard, GlassCard, Modal, Skeleton)
  features/     ← globe/, particles/, budget/, admin/, itinerary/
  hooks/        ← useAuth, useTrips, useCities, useActivities
  store/        ← authStore, tripsStore, uiStore (Zustand)
  lib/          ← supabase.ts, schemas.ts
```

## Rules
- No alert() — use react-hot-toast
- No flat cards — every card has depth/shadow/tilt
- No native form controls — custom date pickers
- No Chart.js/D3 for main charts — Three.js 3D
- Lazy-load all Three.js scenes with Suspense
- Skeleton loaders on all async fetches
- Mobile-first: breakpoints 768px + 1024px

## 14 Screens
1. /auth — Login/Signup
2. / — Dashboard (globe hero)
3. /trips/new — Create Trip wizard
4. /trips — My Trips list
5. /trips/:id/build — Itinerary Builder
6. /trips/:id — Itinerary View
7. /cities — City Search
8. /activities — Activity Search
9. /trips/:id/budget — Budget Breakdown
10. /trips/:id/checklist — Packing Checklist
11. /share/:token — Public Itinerary (read-only)
12. /profile — User Profile
13. /trips/:id/notes — Trip Notes
14. /admin — Admin Dashboard
