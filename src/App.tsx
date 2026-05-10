import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Suspense, lazy, useEffect } from 'react'
import { NavBar } from '@/components/NavBar'
import { useAuthStore } from '@/store/authStore'
import { useAuthListener } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard, Luggage, Map, Activity, User, ShieldCheck,
} from 'lucide-react'

// Lazy-load all pages
const Auth = lazy(() => import('@/pages/Auth'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const CreateTrip = lazy(() => import('@/pages/CreateTrip'))
const MyTrips = lazy(() => import('@/pages/MyTrips'))
const ItineraryBuilder = lazy(() => import('@/pages/ItineraryBuilder'))
const ItineraryView = lazy(() => import('@/pages/ItineraryView'))
const TripDetail = lazy(() => import('@/pages/TripDetail'))
const CitySearch = lazy(() => import('@/pages/CitySearch'))
const ActivitySearch = lazy(() => import('@/pages/ActivitySearch'))
const Budget = lazy(() => import('@/pages/Budget'))
const Checklist = lazy(() => import('@/pages/Checklist'))
const PublicItinerary = lazy(() => import('@/pages/PublicItinerary'))
const Profile = lazy(() => import('@/pages/Profile'))
const Notes = lazy(() => import('@/pages/Notes'))
const Admin = lazy(() => import('@/pages/Admin'))

export const ADMIN_EMAIL = 'admin@traveloop.com'

function PageLoader() {
  return (
    <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-[var(--accent-teal)] border-t-[var(--accent-gold)] animate-spin" />
    </div>
  )
}

// ── Global sidebar (shown on all protected pages) ─────────────────────────
const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/trips', icon: Luggage, label: 'My Trips' },
  { to: '/cities', icon: Map, label: 'Cities' },
  { to: '/activities', icon: Activity, label: 'Activities' },
  { to: '/profile', icon: User, label: 'Profile' },
]

function GlobalSidebar() {
  const location = useLocation()
  const { user } = useAuthStore()
  const isAdmin = user?.email === ADMIN_EMAIL
  const items = isAdmin
    ? [...NAV_ITEMS, { to: '/admin', icon: ShieldCheck, label: 'Admin' }]
    : NAV_ITEMS

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-16 z-40 flex flex-col items-center py-5 gap-1.5 border-r border-[var(--glass-border)]"
      style={{ background: 'var(--bg-mid)' }}>
      {items.map(({ to, icon: Icon, label }) => {
        const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
        return (
          <Link
            key={to}
            to={to}
            title={label}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group"
            style={{
              background: active ? 'var(--accent-gold)' : 'transparent',
              color: active ? 'var(--bg-deep)' : 'var(--text-muted)',
            }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)' }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <Icon size={17} />
            {/* Tooltip */}
            <span
              className="pointer-events-none absolute left-12 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50"
              style={{
                background: 'var(--bg-mid)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </aside>
  )
}

// ── Route guards ──────────────────────────────────────────────────────────
function ProtectedLayout() {
  const { user, loading } = useAuthStore()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/auth" replace />
  return (
    <>
      <NavBar />
      <GlobalSidebar />
      <div className="pl-16">
        <Outlet />
      </div>
    </>
  )
}

function AdminGuard() {
  const { user } = useAuthStore()
  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-[var(--bg-deep)] pt-16 flex items-center justify-center">
        <div className="glass rounded-2xl p-10 text-center max-w-sm">
          <ShieldCheck size={40} className="text-[var(--accent-gold)] mx-auto mb-4 opacity-50" />
          <h2 className="font-display text-2xl text-[var(--text-primary)] mb-2">Access Denied</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">This page is for administrators only.</p>
          <Link to="/" className="btn-gold px-5 py-2 rounded-xl text-sm">Back to Dashboard</Link>
        </div>
      </div>
    )
  }
  return <Outlet />
}

function AuthLayout() {
  const { user, loading } = useAuthStore()
  if (loading) return <PageLoader />
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}

export default function App() {
  useAuthListener()

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/auth" element={<Auth />} />
          </Route>

          {/* Public share (no auth required) */}
          <Route path="/share/:token" element={<PublicItinerary />} />

          {/* Protected routes — all get NavBar + GlobalSidebar */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trips" element={<MyTrips />} />
            <Route path="/trips/new" element={<CreateTrip />} />
            <Route path="/trips/:id" element={<TripDetail />} />
            <Route path="/trips/:id/view" element={<ItineraryView />} />
            <Route path="/trips/:id/build" element={<ItineraryBuilder />} />
            <Route path="/trips/:id/budget" element={<Budget />} />
            <Route path="/trips/:id/checklist" element={<Checklist />} />
            <Route path="/trips/:id/notes" element={<Notes />} />
            <Route path="/cities" element={<CitySearch />} />
            <Route path="/activities" element={<ActivitySearch />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin — email-gated */}
            <Route element={<AdminGuard />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-mid)',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: 'var(--accent-gold)', secondary: 'var(--bg-deep)' } },
          error: { iconTheme: { primary: '#f87171', secondary: 'var(--bg-deep)' } },
        }}
      />
    </BrowserRouter>
  )
}
