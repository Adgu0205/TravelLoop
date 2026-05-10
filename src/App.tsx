import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Suspense, lazy, useEffect } from 'react'
import { NavBar } from '@/components/NavBar'
import { useAuthStore } from '@/store/authStore'
import { useAuthListener } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

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

function PageLoader() {
  return (
    <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-[var(--accent-teal)] border-t-[var(--accent-gold)] animate-spin" />
    </div>
  )
}

function ProtectedLayout() {
  const { user, loading } = useAuthStore()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/auth" replace />
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  )
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

          {/* Protected routes */}
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
            <Route path="/admin" element={<Admin />} />
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
