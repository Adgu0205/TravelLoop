import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Sparkles, ChevronRight, MapPin, Calendar, Wallet, ArrowUpRight } from 'lucide-react'
import { Globe, type GlobePin } from '@/features/globe/Globe'
import { TripPlannerModal } from '@/components/TripPlannerModal'
import { useTrips } from '@/hooks/useTrips'
import { useCities } from '@/hooks/useCities'
import { useAuthStore } from '@/store/authStore'
import { useFormatCurrency } from '@/components/CurrencyToggle'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type City = Database['public']['Tables']['cities']['Row']
type Trip = Database['public']['Tables']['trips']['Row']

// ── Budget bar ────────────────────────────────────────────────────────────
function BudgetBar({ trips }: { trips: Trip[] }) {
  const total = trips.reduce((s, t) => s + Number(t.total_budget), 0)
  const fmt = useFormatCurrency()
  const segments = [
    { label: 'Transport', pct: 25, color: 'bg-[var(--accent-gold)]' },
    { label: 'Stay', pct: 35, color: 'bg-[var(--accent-teal)]' },
    { label: 'Meals', pct: 20, color: 'bg-[var(--accent-sage)]' },
    { label: 'Activities', pct: 15, color: 'bg-emerald-500' },
    { label: 'Misc', pct: 5, color: 'bg-purple-400' },
  ]
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[var(--text-muted)]">Total across {trips.length} trip{trips.length !== 1 ? 's' : ''}</span>
        <span className="text-sm font-semibold text-[var(--text-primary)]">{fmt(total)}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
        {segments.map(s => (
          <div key={s.label} className={`${s.color} opacity-80`} style={{ width: `${s.pct}%` }} />
        ))}
      </div>
      <div className="flex gap-3 mt-2 flex-wrap">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
            <span className="text-[10px] text-[var(--text-muted)]">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Trip row item ──────────────────────────────────────────────────────────
function TripRow({ trip, onClick }: { trip: Trip; onClick: () => void }) {
  const fmt = useFormatCurrency()
  const isUpcoming = trip.start_date && trip.start_date >= new Date().toISOString().split('T')[0]
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 py-2.5 border-b border-[var(--glass-border)] last:border-0 cursor-pointer group"
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-sage))' }}>
        <MapPin size={13} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{trip.name}</p>
        <p className="text-xs text-[var(--text-muted)]">
          {trip.start_date ?? 'No dates set'}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-medium text-[var(--accent-gold)]">{fmt(Number(trip.total_budget))}</p>
        {isUpcoming && (
          <span className="text-[10px] text-emerald-500 font-medium">Upcoming</span>
        )}
      </div>
      <ArrowUpRight size={13} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { trips } = useTrips()
  const { cities } = useCities()
  const fmt = useFormatCurrency()
  const [globePins, setGlobePins] = useState<GlobePin[]>([])
  const [loadingPins, setLoadingPins] = useState(true)
  const [plannerOpen, setPlannerOpen] = useState(false)

  const firstName = user?.user_metadata?.name?.split(' ')[0] ?? 'Traveler'
  const nextTrip = trips.find(t => t.start_date && t.start_date >= new Date().toISOString().split('T')[0])
  const totalBudget = trips.reduce((s, t) => s + Number(t.total_budget), 0)

  useEffect(() => {
    async function buildPins() {
      if (!trips.length) { setLoadingPins(false); return }
      const { data: stops } = await supabase
        .from('stops').select('*, cities(*)')
        .in('trip_id', trips.map(t => t.id))
      if (!stops) { setLoadingPins(false); return }
      const pins: GlobePin[] = (stops as any[]).flatMap(stop => {
        const city = stop.cities as City | null
        const trip = trips.find(t => t.id === stop.trip_id)
        if (!city?.lat || !city?.lng) return []
        return [{ lat: city.lat, lng: city.lng, label: city.name, tripName: trip?.name }]
      })
      setGlobePins(pins)
      setLoadingPins(false)
    }
    buildPins()
  }, [trips])

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  })

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pt-16">
      {/* ── Header ── */}
      <div className="px-5 md:px-7 pt-6 pb-4 flex items-start justify-between gap-4">
        <motion.div {...stagger(0)}>
          <p className="text-xs font-medium tracking-widest uppercase text-[var(--accent-gold)] mb-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="font-display text-2xl lg:text-3xl text-[var(--text-primary)] leading-tight">
            {firstName}'s World
          </h1>
        </motion.div>
        <motion.div {...stagger(1)} className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setPlannerOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-gold)] transition-all"
          >
            <Sparkles size={13} /> AI Planner
          </button>
          <button
            onClick={() => navigate('/trips/new')}
            className="btn-gold flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
          >
            <Plus size={14} /> New Trip
          </button>
        </motion.div>
      </div>

      {/* ── Globe + Cards section ── */}
      <div className="px-5 md:px-7 pb-5">
        <div className="grid gap-4"
          style={{
            gridTemplateColumns: 'minmax(0,1fr) 300px',
            gridTemplateRows: '176px 176px 176px',
          }}
        >
          {/* Globe — takes full left column, all 3 rows */}
          <motion.div
            {...stagger(1)}
            className="row-span-3 rounded-2xl overflow-hidden relative border border-[var(--glass-border)]"
            style={{ background: 'var(--bg-surface)' }}
          >
            {loadingPins ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-[var(--accent-teal)] border-t-[var(--accent-gold)] animate-spin opacity-50" />
              </div>
            ) : (
              <Globe pins={globePins} className="w-full h-full" height="100%" />
            )}

            {/* Pin count overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)' }}>
              <MapPin size={11} className="text-[var(--accent-gold)]" />
              <span className="text-xs font-medium text-[var(--text-primary)]">
                {globePins.length} pin{globePins.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Explore link */}
            <button
              onClick={() => navigate('/cities')}
              className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
              style={{ background: 'var(--accent-gold)', color: 'var(--bg-deep)' }}
            >
              Explore cities <ChevronRight size={11} />
            </button>
          </motion.div>

          {/* Card 1 — Next trip */}
          <motion.div {...stagger(2)} className="glass rounded-2xl p-4 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Next trip</span>
              {nextTrip && (
                <button onClick={() => navigate(`/trips/${nextTrip.id}`)}
                  className="text-[var(--accent-gold)] hover:opacity-80 transition-opacity">
                  <ArrowUpRight size={14} />
                </button>
              )}
            </div>
            {nextTrip ? (
              <>
                <div>
                  <p className="font-display text-base text-[var(--text-primary)] leading-tight mb-1">{nextTrip.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <Calendar size={10} />
                    <span>{nextTrip.start_date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                    <div className="h-full bg-[var(--accent-gold)] rounded-full" style={{ width: '35%' }} />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">Planning</span>
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-[var(--text-muted)] mb-2">No upcoming trips</p>
                <button onClick={() => navigate('/trips/new')}
                  className="text-xs text-[var(--accent-gold)] hover:underline">
                  Plan one now
                </button>
              </div>
            )}
          </motion.div>

          {/* Card 2 — Budget */}
          <motion.div {...stagger(3)} className="glass rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-3">
              <Wallet size={12} className="text-[var(--accent-gold)]" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Budget</span>
            </div>
            {trips.length > 0 ? (
              <BudgetBar trips={trips} />
            ) : (
              <p className="text-xs text-[var(--text-muted)] text-center py-2">Create a trip to track budget</p>
            )}
          </motion.div>

          {/* Card 3 — Quick actions */}
          <motion.div {...stagger(4)} className="glass rounded-2xl p-4 flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">Quick actions</span>
            <button
              onClick={() => navigate('/trips/new')}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent-teal), #0e3d55)' }}
            >
              <Plus size={14} /> Plan new trip
            </button>
            <button
              onClick={() => setPlannerOpen(true)}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all border border-[var(--glass-border)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]"
            >
              <Sparkles size={14} /> AI Smart Planner
            </button>
            <button
              onClick={() => navigate('/cities')}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <MapPin size={13} /> Browse destinations
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── Recent Trips ── */}
      {trips.length > 0 && (
        <motion.div {...stagger(5)} className="px-5 md:px-7 pb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent trips</h2>
            <button onClick={() => navigate('/trips')}
              className="text-xs text-[var(--accent-gold)] hover:underline flex items-center gap-1">
              All trips <ChevronRight size={12} />
            </button>
          </div>
          <div className="glass rounded-2xl px-4 divide-y-0">
            {trips.slice(0, 5).map(trip => (
              <TripRow key={trip.id} trip={trip} onClick={() => navigate(`/trips/${trip.id}`)} />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Destinations scroll ── */}
      {cities.length > 0 && (
        <motion.div {...stagger(6)} className="px-5 md:px-7 pb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Explore destinations</h2>
            <button onClick={() => navigate('/cities')}
              className="text-xs text-[var(--accent-gold)] hover:underline flex items-center gap-1">
              All cities <ChevronRight size={12} />
            </button>
          </div>
          <div className="scroll-row">
            {cities.slice(0, 12).map(city => (
              <div key={city.id} onClick={() => navigate(`/cities?q=${city.name}`)}
                className="shrink-0 w-36 cursor-pointer group">
                <div className="h-24 rounded-xl overflow-hidden mb-1.5 relative">
                  {city.cover_image_url
                    ? <img src={city.cover_image_url} alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full"
                        style={{ background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-sage))' }} />
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-1.5 left-2 right-2">
                    <p className="text-[11px] font-semibold text-white leading-tight">{city.name}</p>
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] truncate">{city.country}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <TripPlannerModal open={plannerOpen} onClose={() => setPlannerOpen(false)} />
    </div>
  )
}
