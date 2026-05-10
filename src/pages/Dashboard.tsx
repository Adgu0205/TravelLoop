import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, MapPin, Calendar, DollarSign, ChevronRight, Compass, Sparkles } from 'lucide-react'
import { Globe, type GlobePin } from '@/features/globe/Globe'
import { TiltCard } from '@/components/TiltCard'
import { Skeleton, TripCardSkeleton } from '@/components/Skeleton'
import { TripPlannerModal } from '@/components/TripPlannerModal'
import { useTrips } from '@/hooks/useTrips'
import { useCities } from '@/hooks/useCities'
import { useAuthStore } from '@/store/authStore'
import { useFormatCurrency } from '@/components/CurrencyToggle'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Stop = Database['public']['Tables']['stops']['Row']
type City = Database['public']['Tables']['cities']['Row']

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { trips } = useTrips()
  const { cities } = useCities()
  const fmt = useFormatCurrency()
  const [globePins, setGlobePins] = useState<GlobePin[]>([])
  const [loadingPins, setLoadingPins] = useState(true)
  const [plannerOpen, setPlannerOpen] = useState(false)

  useEffect(() => {
    async function buildPins() {
      if (!trips.length || !cities.length) { setLoadingPins(false); return }
      const tripIds = trips.map((t) => t.id)
      const { data: stops } = await supabase
        .from('stops')
        .select('*, cities(*)')
        .in('trip_id', tripIds)

      if (!stops) { setLoadingPins(false); return }
      const pins: GlobePin[] = []
      for (const stop of stops as any[]) {
        const city = stop.cities as City | null
        const trip = trips.find((t) => t.id === stop.trip_id)
        if (city) {
          pins.push({ lat: city.lat, lng: city.lng, label: city.name, tripName: trip?.name })
        }
      }
      setGlobePins(pins)
      setLoadingPins(false)
    }
    buildPins()
  }, [trips, cities])

  const recentTrips = trips.slice(0, 8)
  const recommended = cities.slice(0, 6)
  const totalBudget = trips.reduce((s, t) => s + Number(t.total_budget), 0)

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pt-16">
      {/* Globe Hero */}
      <div className="relative" style={{ height: '60vh', minHeight: 400 }}>
        <Globe pins={globePins} className="absolute inset-0 w-full h-full" height="100%" />

        {/* Gradient overlay bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-deep)] to-transparent" />

        {/* Hero text */}
        <div className="absolute inset-0 flex items-center justify-start pointer-events-none">
          <div className="px-8 max-w-lg">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[var(--accent-gold)] text-sm font-medium uppercase tracking-widest mb-2"
            >
              Welcome back, {user?.user_metadata?.name?.split(' ')[0] ?? 'Traveler'}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-4xl md:text-5xl text-[var(--text-primary)] leading-tight"
            >
              Where are you<br />going next?
            </motion.h1>
          </div>
        </div>

        {/* Budget widget */}
        {trips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-8 right-8 glass rounded-2xl p-4 min-w-[160px]"
          >
            <p className="text-xs text-[var(--text-muted)] mb-1 flex items-center gap-1">
              <DollarSign size={12} /> Total Budget
            </p>
            <p className="font-display text-2xl text-[var(--accent-gold)]">{fmt(totalBudget)}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''}</p>
          </motion.div>
        )}

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-12 left-8 pointer-events-auto flex gap-3"
        >
          <button
            onClick={() => navigate('/trips/new')}
            className="btn-gold px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-glow-gold"
          >
            <Plus size={18} />
            Plan New Trip
          </button>
          <button
            onClick={() => setPlannerOpen(true)}
            className="px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold border border-[var(--accent-gold)]/50 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors backdrop-blur-sm"
          >
            <Sparkles size={16} />
            Smart Planner
          </button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {/* Recent Trips */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl text-[var(--text-primary)]">Recent Trips</h2>
            <button
              onClick={() => navigate('/trips')}
              className="flex items-center gap-1 text-sm text-[var(--accent-gold)] hover:underline"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>

          {trips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 glass rounded-2xl">
              <Compass size={48} className="text-[var(--accent-teal)] mb-4 animate-float-up" />
              <p className="font-display text-xl text-[var(--text-primary)] mb-2">No trips yet</p>
              <p className="text-[var(--text-muted)] text-sm mb-6">Create your first adventure</p>
              <button onClick={() => navigate('/trips/new')} className="btn-gold px-5 py-2 rounded-xl text-sm">
                Start Planning
              </button>
            </div>
          ) : (
            <div className="scroll-row">
              {recentTrips.map((trip) => (
                <TiltCard key={trip.id} className="shrink-0 w-72">
                  <div
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    className="glass rounded-2xl overflow-hidden cursor-pointer h-full"
                  >
                    <div
                      className="h-40 bg-cover bg-center relative"
                      style={{
                        backgroundImage: trip.cover_photo_url
                          ? `url(${trip.cover_photo_url})`
                          : `linear-gradient(135deg, var(--bg-surface), var(--accent-teal))`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)]/80 to-transparent" />
                      {trip.is_public && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 bg-[var(--accent-gold)] text-[var(--bg-deep)] text-xs rounded-full font-medium">
                          Public
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-base text-[var(--text-primary)] mb-1 truncate">{trip.name}</h3>
                      {(trip.start_date || trip.end_date) && (
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mb-2">
                          <Calendar size={11} />
                          {trip.start_date ?? '?'} → {trip.end_date ?? '?'}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-[var(--bg-surface)] rounded-full text-[var(--accent-sage)]">
                          {fmt(Number(trip.total_budget))}
                        </span>
                        <ChevronRight size={14} className="text-[var(--text-muted)]" />
                      </div>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          )}
        </motion.section>

        {/* Recommended Destinations */}
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl text-[var(--text-primary)]">Explore Destinations</h2>
            <button onClick={() => navigate('/cities')} className="flex items-center gap-1 text-sm text-[var(--accent-gold)] hover:underline">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommended.length === 0
              ? Array.from({ length: 6 }).map((_, i) => <TripCardSkeleton key={i} />)
              : recommended.map((city) => (
                  <TiltCard key={city.id} intensity={8}>
                    <div
                      onClick={() => navigate(`/cities?q=${city.name}`)}
                      className="glass rounded-2xl overflow-hidden cursor-pointer group"
                    >
                      <div
                        className="h-48 bg-cover bg-center relative"
                        style={{ backgroundImage: city.cover_image_url ? `url(${city.cover_image_url})` : 'none' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="font-display text-xl text-[var(--text-primary)]">{city.name}</h3>
                          <p className="text-[var(--text-muted)] text-sm">{city.country}</p>
                        </div>
                        <div className="absolute top-3 right-3 flex items-center gap-1 glass rounded-lg px-2 py-1">
                          <MapPin size={10} className="text-[var(--accent-gold)]" />
                          <span className="text-xs text-[var(--text-primary)]">
                            Cost {city.cost_index}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                ))}
          </div>
        </motion.section>
      </div>

      <TripPlannerModal open={plannerOpen} onClose={() => setPlannerOpen(false)} />
    </div>
  )
}
