import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Map, List, Printer, Clock, Tag, DollarSign } from 'lucide-react'
import { Globe, type GlobePin } from '@/features/globe/Globe'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Stop = Database['public']['Tables']['stops']['Row'] & {
  cities?: { name: string; country: string; lat: number; lng: number } | null
  stop_activities?: Array<{
    id: string
    scheduled_time: string | null
    cost_override: number | null
    notes: string | null
    activities: { name: string; category: string; cost_estimate: number; duration_hours: number } | null
  }>
}

export default function ItineraryView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [view, setView] = useState<'timeline' | 'map'>('timeline')
  const [trip, setTrip] = useState<any>(null)
  const [stops, setStops] = useState<Stop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      const [tripRes, stopsRes] = await Promise.all([
        supabase.from('trips').select('*').eq('id', id!).single(),
        supabase.from('stops')
          .select('*, cities(name,country,lat,lng), stop_activities(id,scheduled_time,cost_override,notes,activities(name,category,cost_estimate,duration_hours))')
          .eq('trip_id', id!)
          .order('position_order'),
      ])
      if (tripRes.data) setTrip(tripRes.data)
      if (stopsRes.data) setStops(stopsRes.data as Stop[])
      setLoading(false)
    }
    load()
  }, [id])

  const globePins: GlobePin[] = stops.filter((s) => s.cities).map((s) => ({
    lat: s.cities!.lat, lng: s.cities!.lng, label: s.cities!.name,
  }))

  const CATEGORY_COLORS: Record<string, string> = {
    adventure: 'bg-orange-500/20 text-orange-300',
    culture: 'bg-yellow-500/20 text-yellow-300',
    food: 'bg-green-500/20 text-green-300',
    nightlife: 'bg-purple-500/20 text-purple-300',
    nature: 'bg-emerald-500/20 text-emerald-300',
    shopping: 'bg-pink-500/20 text-pink-300',
    wellness: 'bg-blue-500/20 text-blue-300',
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pt-16">
      {/* Header */}
      <div className="glass-strong border-b border-[var(--glass-border)] px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(`/trips/${id}`)} className="w-8 h-8 glass rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl text-[var(--text-primary)]">{trip?.name ?? 'Trip Itinerary'}</h1>
            <p className="text-xs text-[var(--text-muted)]">{stops.length} stops · {stops.reduce((t, s) => t + (s.stop_activities?.length ?? 0), 0)} activities</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="glass rounded-lg flex overflow-hidden">
              {(['timeline', 'map'] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs flex items-center gap-1 transition-colors ${view === v ? 'bg-[var(--accent-gold)] text-[var(--bg-deep)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                  {v === 'timeline' ? <List size={12} /> : <Map size={12} />}
                  {v === 'timeline' ? 'Timeline' : 'Map'}
                </button>
              ))}
            </div>
            <button onClick={() => window.print()} className="w-8 h-8 glass rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <Printer size={14} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'map' ? (
          <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-120px)]">
            <Globe pins={globePins} height="100%" />
          </motion.div>
        ) : (
          <motion.div key="timeline" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
              </div>
            ) : stops.length === 0 ? (
              <div className="text-center py-16 text-[var(--text-muted)]">No stops added yet. <button onClick={() => navigate(`/trips/${id}/build`)} className="text-[var(--accent-gold)] hover:underline">Build your itinerary →</button></div>
            ) : (
              <div className="relative">
                <div className="absolute left-[22px] top-0 bottom-0 w-px bg-[var(--accent-teal)]/30" />
                {stops.map((stop, i) => (
                  <motion.div key={stop.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="relative pl-12 mb-10">
                    {/* Timeline dot */}
                    <div className="absolute left-0 w-11 h-11 rounded-full bg-gradient-to-br from-[var(--accent-teal)] to-[var(--accent-sage)] flex items-center justify-center text-lg font-display font-bold text-[var(--text-primary)] shadow-glow">
                      {i + 1}
                    </div>

                    {/* City header */}
                    <div className="glass rounded-2xl overflow-hidden mb-3">
                      <div className="p-5 border-b border-[var(--glass-border)]">
                        <h2 className="font-display text-2xl text-[var(--text-primary)]">{stop.cities?.name}</h2>
                        <p className="text-[var(--text-muted)] text-sm">{stop.cities?.country}</p>
                        {(stop.start_date || stop.end_date) && (
                          <p className="text-xs text-[var(--accent-gold)] mt-1">{stop.start_date} → {stop.end_date}</p>
                        )}
                      </div>

                      {/* Activities */}
                      {stop.stop_activities && stop.stop_activities.length > 0 ? (
                        <div className="divide-y divide-[var(--glass-border)]">
                          {stop.stop_activities.map((sa) => (
                            <div key={sa.id} className="p-4 flex items-start gap-3">
                              {sa.scheduled_time && (
                                <span className="shrink-0 text-xs text-[var(--text-muted)] flex items-center gap-1 pt-0.5">
                                  <Clock size={10} />{sa.scheduled_time}
                                </span>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium text-[var(--text-primary)]">{sa.activities?.name}</span>
                                  {sa.activities?.category && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[sa.activities.category] ?? 'bg-gray-500/20 text-gray-300'}`}>
                                      {sa.activities.category}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-xs text-[var(--text-muted)]">
                                  {sa.activities?.duration_hours && (
                                    <span><Clock size={10} className="inline mr-0.5" />{sa.activities.duration_hours}h</span>
                                  )}
                                  <span className="text-[var(--accent-gold)]">
                                    <DollarSign size={10} className="inline" />
                                    ₹{(sa.cost_override ?? sa.activities?.cost_estimate ?? 0).toLocaleString()}
                                  </span>
                                </div>
                                {sa.notes && <p className="text-xs text-[var(--text-muted)] mt-1">{sa.notes}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-xs text-[var(--text-muted)] text-center">
                          No activities added yet. <button onClick={() => navigate(`/trips/${id}/build`)} className="text-[var(--accent-gold)] hover:underline">Add activities →</button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
