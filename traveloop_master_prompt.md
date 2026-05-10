# 🌍 TRAVELOOP — Master Hackathon Prompt
**Version**: 1.0 | **Target**: Hackathon-winning full-stack travel app  
**Stack**: React + Three.js/R3F + TailwindCSS + Supabase/PostgreSQL

---

## ROLE & MISSION

You are a **senior full-stack engineer and creative UI/UX architect** building **Traveloop** — a personalized, intelligent travel planning web application for a hackathon. Your job is to produce production-quality, visually extraordinary code that will stand out from every other submission.

This is not a generic CRUD app. This is a **cinematic travel experience** — every screen should feel like opening a luxury travel magazine that came alive in 3D.

---

## DESIGN PHILOSOPHY — NON-NEGOTIABLE

### Visual Identity
- **Aesthetic**: Dark-luxury glassmorphism meets interactive 3D Earth atlas
- **Color Palette**: Deep midnight navy `#0a0f1e`, electric teal `#00d4aa`, warm amber `#f59e0b`, soft white `#f0f4ff`
- **Typography**: `Playfair Display` (headings, hero text) + `DM Sans` (body, UI labels) — import from Google Fonts
- **Motion**: Every screen transition uses a smooth 3D parallax or card-flip animation. Idle states have floating particle dust or subtle globe rotation.
- **Uniqueness rule**: If another hackathon team could have built it without Three.js, you haven't done enough.

### 3D Elements (MANDATORY — This is what wins)
Use **Three.js** (via `@react-three/fiber` + `@react-three/drei`) for:

1. **Globe on Dashboard** — An interactive 3D Earth globe. User's trip stops appear as glowing pins. Hovering a pin shows a tooltip card. The globe auto-rotates when idle.
2. **3D City Cards** — Trip stop cards tilt in 3D on mouse hover (CSS `perspective` + `rotateX/Y` transforms, not flat cards).
3. **Floating Route Path** — In the Itinerary View, a 3D animated arc line connects cities on a mini-globe or isometric map.
4. **Particle Background** — Subtle floating star/dust particles (Three.js `Points`) on the login screen and dashboard hero.
5. **3D Budget Donut** — The budget breakdown uses an animated 3D pie/torus rendered in WebGL, not a flat chart.

---

## APPLICATION SCREENS — BUILD ALL 14

### SCREEN 1 — Login / Signup
- Split-screen layout: LEFT = interactive 3D particle globe (slow spin, teal glow), RIGHT = auth form
- Glass card with frosted blur effect (`backdrop-filter: blur(20px)`)
- Fields: Email, Password — with animated floating labels
- Toggle between Login / Signup with a smooth height-transition
- "Forgot Password" link, Google OAuth button (UI only if backend not wired)
- On submit: loading state shows a small 3D airplane model flying across the button

### SCREEN 2 — Dashboard / Home
- Full-bleed **interactive 3D globe** (Three.js) as the hero — user's trip pins glow on it
- Top nav: Logo + search bar + avatar
- Below globe: horizontal scroll row of "Recent Trips" as **3D tilt cards**
- "Plan New Trip" CTA button — large, amber gradient, with hover ripple
- "Recommended Destinations" section: cards with parallax image effect on scroll
- Budget summary widget in top-right corner of globe section

### SCREEN 3 — Create Trip
- Full-screen modal or dedicated page with a **step wizard** (3 steps):
  - Step 1: Trip Name + Description + Cover Photo upload (drag-drop zone)
  - Step 2: Start & End Dates (custom calendar picker, not native browser one)
  - Step 3: Invite collaborators (email input chips)
- Progress bar at top with animated fill
- Background: blurred city image with dark overlay + floating particles

### SCREEN 4 — My Trips (Trip List)
- Masonry/grid layout of trip cards
- Each card: cover image, trip name, date range, city count badge, budget pill
- **3D tilt effect** on hover (CSS transforms with JS mouse tracking)
- Filter bar: All / Upcoming / Past / Draft
- Empty state: animated 3D airplane with "No trips yet" message

### SCREEN 5 — Itinerary Builder
- Three-panel layout:
  - LEFT: City stop list (draggable to reorder with drag handles)
  - CENTER: Day-by-day activity assignment (timeline accordion)
  - RIGHT: Mini **3D globe** showing current route arcs between cities
- "Add Stop" button opens a city search modal
- Each stop: city name, dates, activity chips
- Drag-and-drop reordering using `@dnd-kit/core`

### SCREEN 6 — Itinerary View
- Toggle between **Timeline view** and **Map view**
- Timeline: vertical scrolling day blocks with city headers and activity rows
- Map view: **3D globe with animated arc paths** between all stops (Three.js `TubeGeometry` or `Line`)
- Activity blocks show time, cost estimate, category icon
- Print/export button in top-right

### SCREEN 7 — City Search
- Full-screen search modal with instant results
- Each city result: flag emoji, city name, country, cost index bar, popularity stars
- **3D card flip** on click reveals more info (landmarks, weather, avg budget)
- "Add to Trip" button on each card
- Filter chips: Region, Budget Level, Climate

### SCREEN 8 — Activity Search
- Two-column layout: filter sidebar (LEFT) + activity grid (RIGHT)
- Filters: Category (adventure/culture/food/nightlife), Cost range slider, Duration
- Activity cards: image thumbnail, name, duration, cost, rating
- Hover state: card rises with drop shadow, reveals "Quick View" overlay
- "Add to Stop" button with animated checkmark on success

### SCREEN 9 — Budget & Cost Breakdown
- Hero: Total budget gauge (animated arc, fills on load)
- **3D donut chart** (Three.js `TorusGeometry` with colored segments) — rotates slowly
- Below: breakdown table — Transport / Stay / Activities / Meals / Misc
- Daily average cost chip
- Alert banner (amber) when any day exceeds budget
- Toggle: INR ₹ / USD $ / EUR €

### SCREEN 10 — Packing Checklist
- Per-trip checklist with category tabs: 👔 Clothing / 📄 Documents / 💻 Electronics / 🧴 Toiletries
- Add custom items with a quick-add input at the top
- Each item: checkbox (animated ✓ on check), item name, optional note
- Progress bar: "X of Y items packed"
- "Reset All" and "Copy to New Trip" buttons
- Confetti animation when 100% packed (use `canvas-confetti`)

### SCREEN 11 — Shared / Public Itinerary View
- Read-only, publicly accessible via unique URL
- Beautiful magazine-style layout — full-width city hero images, day blocks below
- "Copy this Trip" button (prominent, amber)
- Social share buttons: WhatsApp, Twitter/X, Copy Link
- No edit controls visible, watermark "Made with Traveloop"

### SCREEN 12 — User Profile / Settings
- Profile card: avatar (editable), name, email, member since
- Tabs: Account / Preferences / Saved Destinations / Privacy
- Language selector, currency preference, theme toggle (dark/light)
- Saved Destinations: mini grid of bookmarked cities
- Danger zone: Delete Account (requires confirmation modal)

### SCREEN 13 — Trip Notes / Journal
- Per-trip notes with markdown support (simple bold/italic/list rendering)
- Notes list sorted by date, each with timestamp
- Add note: floating action button (+) opens a slide-up editor
- Per-stop filtering: dropdown to filter notes by city stop
- Auto-save indicator (subtle "Saved ✓" in top corner)

### SCREEN 14 — Admin / Analytics Dashboard (Optional but implement it)
- Sidebar layout: nav on LEFT, main content RIGHT
- KPI cards row: Total Users, Trips Created, Active Today, Avg Trip Budget
- **3D bar chart** (Three.js `BoxGeometry`) for trips-per-week
- Table: Top 10 cities by trip count
- User management table with search and role badges
- Activity heatmap calendar

---

## DATABASE SCHEMA (PostgreSQL / Supabase)

Design and implement these tables with proper foreign keys:

```sql
users (id, email, name, avatar_url, language, currency, created_at)
trips (id, user_id, name, description, cover_photo_url, start_date, end_date, total_budget, is_public, share_token, created_at)
stops (id, trip_id, city_id, position_order, start_date, end_date)
cities (id, name, country, region, lat, lng, cost_index, popularity_score, cover_image_url)
activities (id, city_id, name, category, cost_estimate, duration_hours, description, image_url)
stop_activities (id, stop_id, activity_id, scheduled_time, cost_override, notes)
budgets (id, trip_id, transport, stay, activities, meals, misc, total_limit)
checklist_items (id, trip_id, category, item_name, is_packed, note)
trip_notes (id, trip_id, stop_id, content, created_at, updated_at)
```

---

## TECH STACK

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| 3D / WebGL | Three.js + @react-three/fiber + @react-three/drei |
| Styling | TailwindCSS + custom CSS variables |
| Animation | Framer Motion + GSAP (for scroll triggers) |
| Drag & Drop | @dnd-kit/core |
| State | Zustand |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Charts | Three.js (3D) + Recharts (2D fallback) |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |

---

## IMPLEMENTATION CONSTRAINTS

### DO:
- Use CSS `perspective` + `rotateX/Y` for all 2D card hover tilts (mouse tracking via JS)
- Lazy-load Three.js scenes with `<Suspense>` to prevent blocking page load
- Use Supabase Row Level Security (RLS) so users only access their own data
- Make all screens responsive (mobile-first breakpoints at 768px and 1024px)
- Add skeleton loaders for all async data fetches
- Use `IntersectionObserver` for scroll-triggered entrance animations
- Add `loading="lazy"` to all city/activity images

### DO NOT:
- Do not use Chart.js or D3 for the main charts — use Three.js 3D versions
- Do not use flat, static card designs — every card must have depth, shadow, or tilt
- Do not use default browser form controls — build custom date pickers and selects
- Do not use generic purple-gradient-on-white color schemes
- Do not skip the globe — it's the centerpiece and judging differentiator
- Do not use `alert()` for any user feedback — use toast notifications (react-hot-toast)

---

## EXECUTION ORDER

Build in this exact sequence to stay unblocked:

1. **Setup**: Vite + React + Tailwind + Supabase client + Three.js install
2. **DB**: Run schema SQL in Supabase, seed cities and activities data (20+ cities, 100+ activities)
3. **Auth**: Screen 1 (Login/Signup with Supabase Auth)
4. **3D Globe Component**: Reusable `<Globe>` component used across screens 2, 5, 6
5. **Dashboard**: Screen 2 (wire globe + trip cards)
6. **Core Trip Flow**: Screens 3 → 4 → 5 → 6 (create → list → build → view)
7. **Search**: Screens 7 + 8 (city and activity search with live filtering)
8. **Budget**: Screen 9 (3D donut + breakdown table)
9. **Utility Screens**: 10, 12, 13
10. **Share**: Screen 11 (public itinerary URL)
11. **Admin**: Screen 14 (last, only if time permits)

---

## JUDGING CRITERIA ALIGNMENT

| Criterion | How Traveloop Wins |
|-----------|-------------------|
| **UI/UX** | 3D globe, tilt cards, cinematic animations — unforgettable first impression |
| **DB Design** | Normalized relational schema, RLS policies, foreign keys, seed data |
| **Functionality** | All 13 core screens fully functional end-to-end |
| **Creativity** | No other team will have an interactive Three.js globe as the main UI element |
| **Code Quality** | Component structure, Zod validation, Zustand state, clean routing |
| **Responsiveness** | Mobile-first, works on phones and tablets |

---

## FINAL INSTRUCTION TO THE MODEL

> Build Traveloop screen by screen, starting with the reusable components (Globe, TiltCard, NavBar, ToastProvider) before the pages. Every component must be visually extraordinary. When in doubt, add more depth — a subtle shadow, a slow rotation, a glass blur layer. The goal is that a judge opens the app and immediately says *"I've never seen a travel app look like this."*

Think step by step. Plan the component tree first, then implement. Do not output placeholder code — every function must work.
