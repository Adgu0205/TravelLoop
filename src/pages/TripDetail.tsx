import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Map, List, DollarSign, CheckSquare, FileText,
  Share2, Hammer, MapPin, Calendar, Users, TrendingUp, Globe as GlobeIcon
} from 'lucide-react'
import { Globe, type GlobeArc } from '@/features/globe/Globe'
import { supabase } from '@/lib/supabase'
import { useFormatCurrency } from '@/components/CurrencyToggle'
import toast from 'react-hot-toast'

export default function TripDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fmt = useFormatCurrency()
  const [trip, setTrip] = useState<any>(null)
  const [stops, setStops] = useState<any[]>([])
  const [budget, setBudget] = useState<any>(null)
  const [checklist, setChecklist] = useState<{ total: number; packed: number }>({ total: 0, packed: 0 })
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      const [tripRes, stopsRes, budgetRes, checklistRes, notesRes] = await Promise.all([
        supabase.from('trips').select('*').eq('id', id!).single(),
        supabase.from('stops').select('*, cities(name,country,lat,lng)').eq('trip_id', id!).order('position_order'),
        supabase.from('budgets').select('*').eq('trip_id', id!).maybeSingle(),
        supabase.from('checklist_items').select('id,is_packed').eq('trip_id', id!),
        supabase.from('trip_notes').select('id,content,created_at').eq('trip_id', id!).order('created_at', { ascending: false }).limit(3),
      ])
      if (tripRes.data) setTrip(tripRes.data)
      if (stopsRes.data) setStops(stopsRes.data)
      if (budgetRes.data) setBudget(budgetRes.data)
      if (checklistRes.data) {
        setChecklist({ total: checklistRes.data.length, packed: checklistRes.data.filter((i: any) => i.is_packed).length })
      }
      if (notesRes.data) setNotes(notesRes.data)
      setLoading(false)
    }
    load()
  }, [id])

  async function togglePublic() {
    if (!trip) return
    const { data } = await supabase.from('trips').update({ is_public: !trip.is_public }).eq('id', id!).select().single()
    if (data) {
      setTrip(data)
      toast.success(data.is_public ? 'Trip is now public' : 'Trip is now private')
    }
  }

  async function copyShareLink() {
    if (!trip?.share_token) return
    await navigator.clipboard.writeText(`${window.location.origin}/share/${trip.share_token}`)
    toast.success('Share link copied!')
  }

  const validStops = stops.filter(s => s.cities?.lat)
  const globePins = validStops.map(s => ({
    lat: s.cities.lat, lng: s.cities.lng, label: s.cities.name,
  }))
  const globeArcs: GlobeArc[] = validStops.slice(0, -1).map((s, i) => ({
    from: [s.cities.lat, s.cities.lng] as [number, number],
    to: [validStops[i + 1].cities.lat, validStops[i + 1].cities.lng] as [number, number],
  }))

  const activitiesCount = stops.reduce((t: number, s: any) => t + (s.stop_activities?.length ?? 0), 0)
  const totalSpent = budget ? (budget.transport + budget.stay + budget.activities + budget.meals + budget.misc) : 0
  const checklistPct = checklist.total > 0 ? Math.round((checklist.packed / checklist.total) * 100) : 0

  const actions = [
    { icon: Hammer, label: 'Build Itinerary', desc: 'Add stops & activities', color: 'var(--accent-gold)', path: `/trips/${id}/build` },
    { icon: List, label: 'View Timeline', desc: 'Day-by-day view', color: 'var(--accent-teal)', path: `/trips/${id}/view` },
    { icon: DollarSign, label: 'Budget', desc: fmt(trip?.total_budget ?? 0) + ' total', color: '#4A8A7A', path: `/trips/${id}/budget` },
    { icon: CheckSquare, label: 'Checklist', desc: `${checklist.packed}/${checklist.total} packed`, color: '#7B6FA0', path: `/trips/${id}/checklist` },
    { icon: FileText, label: 'Notes', desc: `${notes.length} note${notes.length !== 1 ? 's' : ''}`, color: '#8A7060', path: `/trips/${id}/notes` },
    { icon: Share2, label: 'Share', desc: trip?.is_public ? 'Public link active' : 'Make public to share', color: '#C44A2A', action: copyShareLink },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-deep)] pt-16 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--accent-teal)] border-t-[var(--accent-gold)] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pt-16">
      {/* Hero */}
      <div
        className="relative h-56 sm:h-72 bg-cover bg-center"
        style={{
          backgroundImage: trip?.cover_photo_url
            ? `url(${trip.cover_photo_url})`
            : `linear-gradient(135deg, #1B6B8A 0%, #4A8A7A 50%, #C4862A 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-[var(--bg-deep)]/30 to-transparent" />
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate('/trips')}
            className="glass w-9 h-9 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl text-white drop-shadow-lg mb-1">{trip?.name}</h1>
              {trip?.description && (
                <p className="text-white/70 text-sm line-clamp-1">{trip.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {(trip?.start_date || trip?.end_date) && (
                  <span className="flex items-center gap-1 text-white/80 text-xs">
                    <Calendar size={11} />
                    {trip.start_date ?? '?'} → {trip.end_date ?? '?'}
                  </span>
                )}
                <span className="flex items-center gap-1 text-white/80 text-xs">
                  <MapPin size={11} /> {stops.length} stop{stops.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <button
              onClick={togglePublic}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                trip?.is_public
                  ? 'bg-[var(--accent-gold)] text-white'
                  : 'glass text-white/80 hover:bg-white/20'
              }`}
            >
              <GlobeIcon size={11} />
              {trip?.is_public ? 'Public' : 'Private'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Stops', value: stops.length, icon: MapPin, color: 'var(--accent-teal)' },
            { label: 'Activities', value: activitiesCount, icon: TrendingUp, color: 'var(--accent-gold)' },
            { label: 'Budget', value: fmt(trip?.total_budget ?? 0), icon: DollarSign, color: '#4A8A7A' },
            { label: 'Packing', value: `${checklistPct}%`, icon: CheckSquare, color: '#7B6FA0' },
          ].map(({ label, value, icon: Icon, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Actions + Stops */}
          <div className="lg:col-span-2 space-y-5">
            {/* Action grid */}
            <div>
              <h2 className="font-display text-lg text-[var(--text-primary)] mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {actions.map(({ icon: Icon, label, desc, color, path, action }) => (
                  <motion.button
                    key={label}
                    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => action ? action() : navigate(path!)}
                    className="glass rounded-2xl p-4 text-left transition-all border border-[var(--glass-border)] hover:border-[var(--accent-gold)]/40"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Stops list */}
            {stops.length > 0 && (
              <div>
                <h2 className="font-display text-lg text-[var(--text-primary)] mb-3">Stops</h2>
                <div className="space-y-2">
                  {stops.map((stop, i) => (
                    <motion.div
                      key={stop.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="glass rounded-xl p-3 flex items-center gap-3"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent-teal)] to-[var(--accent-sage)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{stop.cities?.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{stop.cities?.country}</p>
                      </div>
                      {(stop.start_date || stop.end_date) && (
                        <span className="text-xs text-[var(--text-muted)] shrink-0">
                          {stop.start_date ?? '?'} → {stop.end_date ?? '?'}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent notes */}
            {notes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-lg text-[var(--text-primary)]">Recent Notes</h2>
                  <button onClick={() => navigate(`/trips/${id}/notes`)} className="text-xs text-[var(--accent-teal)] hover:underline">
                    View all →
                  </button>
                </div>
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div key={note.id} className="glass rounded-xl p-3">
                      <p className="text-xs text-[var(--text-muted)] mb-1">{new Date(note.created_at).toLocaleDateString()}</p>
                      <p className="text-sm text-[var(--text-primary)] line-clamp-2">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Globe */}
          <div className="space-y-4">
            <h2 className="font-display text-lg text-[var(--text-primary)]">Route Map</h2>
            <div className="glass rounded-2xl overflow-hidden" style={{ height: 320 }}>
              {globePins.length > 0 ? (
                <Globe pins={globePins} arcs={globeArcs} showNumbers height="100%" />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-sm gap-2">
                  <MapPin size={32} className="opacity-30" />
                  <p>Add stops to see your route</p>
                  <button onClick={() => navigate(`/trips/${id}/build`)} className="btn-gold px-3 py-1.5 rounded-lg text-xs mt-1">
                    Add Stops
                  </button>
                </div>
              )}
            </div>

            {/* Budget mini summary */}
            {trip?.total_budget > 0 && (
              <div className="glass rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Budget Overview</h3>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Total Budget</span>
                  <span className="text-[var(--accent-gold)] font-semibold">{fmt(trip.total_budget)}</span>
                </div>
                {totalSpent > 0 && (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Allocated</span>
                      <span className="text-[var(--text-primary)]">{fmt(totalSpent)}</span>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, (totalSpent / trip.total_budget) * 100)}%`,
                          background: totalSpent > trip.total_budget ? '#f87171' : 'var(--accent-gold)',
                        }}
                      />
                    </div>
                  </>
                )}
                <button onClick={() => navigate(`/trips/${id}/budget`)} className="w-full btn-teal py-2 rounded-xl text-xs">
                  Manage Budget
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
