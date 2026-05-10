import { useState, useEffect, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Eye, ArrowLeft, Clock, Tag } from 'lucide-react'
import { StopList, type StopWithCity } from '@/features/itinerary/StopList'
import { Globe, type GlobeArc } from '@/features/globe/Globe'
import { Modal } from '@/components/Modal'
import { supabase } from '@/lib/supabase'
import { useCities } from '@/hooks/useCities'
import toast from 'react-hot-toast'
import type { Database } from '@/lib/supabase'

type Stop = StopWithCity
type Activity = Database['public']['Tables']['activities']['Row']
type City = Database['public']['Tables']['cities']['Row']

export default function ItineraryBuilder() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [stops, setStops] = useState<Stop[]>([])
  const [activeStopId, setActiveStopId] = useState<string | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [addStopOpen, setAddStopOpen] = useState(false)
  const [cityQuery, setCityQuery] = useState('')
  const [trip, setTrip] = useState<any>(null)
  const { cities: searchCities, loading: citiesLoading } = useCities(cityQuery)
  const [loading, setLoading] = useState(true)

  const activeStop = stops.find((s) => s.id === activeStopId)

  useEffect(() => {
    if (!id) return
    async function load() {
      setLoading(true)
      const [tripRes, stopsRes] = await Promise.all([
        supabase.from('trips').select('*').eq('id', id!).single(),
        supabase.from('stops').select('*, cities(name,country,lat,lng)').eq('trip_id', id!).order('position_order'),
      ])
      if (tripRes.data) setTrip(tripRes.data)
      if (stopsRes.data) {
        setStops(stopsRes.data as Stop[])
        if (stopsRes.data.length > 0) setActiveStopId(stopsRes.data[0].id)
      }
      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    if (!activeStop?.city_id) return
    supabase.from('activities').select('*').eq('city_id', activeStop.city_id).then(({ data }) => {
      setActivities(data ?? [])
    })
  }, [activeStop?.city_id])

  async function addStop(city: City) {
    if (!id) return
    const { data, error } = await supabase
      .from('stops')
      .insert({ trip_id: id, city_id: city.id, position_order: stops.length })
      .select('*, cities(name,country,lat,lng)')
      .single()
    if (error) { toast.error('Failed to add stop'); return }
    setStops((prev) => [...prev, data as Stop])
    setActiveStopId(data.id)
    setAddStopOpen(false)
    setCityQuery('')
    toast.success(`${city.name} added!`)
  }

  async function deleteStop(stopId: string) {
    await supabase.from('stops').delete().eq('id', stopId)
    setStops((prev) => prev.filter((s) => s.id !== stopId))
    if (activeStopId === stopId) setActiveStopId(stops[0]?.id ?? null)
  }

  async function reorderStops(newOrder: Stop[]) {
    setStops(newOrder)
    await Promise.all(
      newOrder.map((s, i) => supabase.from('stops').update({ position_order: i }).eq('id', s.id))
    )
  }

  async function addActivity(activity: Activity) {
    if (!activeStopId) return
    const { error } = await supabase.from('stop_activities').insert({
      stop_id: activeStopId,
      activity_id: activity.id,
    })
    if (!error) toast.success(`${activity.name} added!`)
    else toast.error('Failed to add activity')
  }

  const validStops = stops.filter((s) => s.cities && s.cities.lat != null && s.cities.lng != null)

  const globePins = validStops.map((s) => ({
    lat: s.cities!.lat as number,
    lng: s.cities!.lng as number,
    label: s.cities!.name,
  }))

  const globeArcs: GlobeArc[] = validStops.slice(0, -1).map((s, i) => ({
    from: [s.cities!.lat as number, s.cities!.lng as number],
    to: [validStops[i + 1].cities!.lat as number, validStops[i + 1].cities!.lng as number],
  }))

  const CATEGORY_COLORS: Record<string, string> = {
    adventure: 'text-orange-400', culture: 'text-[var(--accent-gold)]',
    food: 'text-green-400', nightlife: 'text-purple-400',
    nature: 'text-emerald-400', shopping: 'text-pink-400', wellness: 'text-blue-400',
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pt-16 flex flex-col">
      {/* Top bar */}
      <div className="glass-strong border-b border-[var(--glass-border)] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/trips')} className="w-8 h-8 glass rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <ArrowLeft size={16} />
        </button>
        <h1 className="font-display text-lg text-[var(--text-primary)] flex-1 truncate">
          {trip?.name ?? 'Itinerary Builder'}
        </h1>
        <button
          onClick={() => navigate(`/trips/${id}/view`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs btn-teal"
        >
          <Eye size={12} /> Preview
        </button>
      </div>

      {/* 3-panel layout */}
      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 112px)' }}>
        {/* LEFT — Stop list */}
        <div className="w-72 shrink-0 border-r border-[var(--glass-border)] flex flex-col bg-[var(--bg-mid)]">
          <div className="p-4 border-b border-[var(--glass-border)] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Stops ({stops.length})</h2>
            <button
              onClick={() => setAddStopOpen(true)}
              className="btn-gold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
            >
              <Plus size={12} /> Add
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="space-y-2">
                {[1,2,3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
              </div>
            ) : stops.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                <p>No stops yet.</p>
                <p className="mt-1">Add a city to start.</p>
              </div>
            ) : (
              <StopList
                stops={stops}
                activeStopId={activeStopId ?? undefined}
                onSelect={setActiveStopId}
                onDelete={deleteStop}
                onReorder={reorderStops}
              />
            )}
          </div>
        </div>

        {/* CENTER — Activities */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[var(--glass-border)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {activeStop?.cities?.name ? `Activities in ${activeStop.cities.name}` : 'Select a stop'}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {!activeStop ? (
              <div className="text-center py-12 text-[var(--text-muted)]">
                Select a city stop to browse activities
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)]">Loading activities...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activities.map((act) => (
                  <motion.div
                    key={act.id}
                    whileHover={{ y: -2 }}
                    className="glass rounded-xl p-3 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">{act.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                          <span className={CATEGORY_COLORS[act.category] ?? 'text-[var(--text-muted)]'}>
                            <Tag size={10} className="inline mr-0.5" />{act.category}
                          </span>
                          <span><Clock size={10} className="inline mr-0.5" />{act.duration_hours}h</span>
                          <span className="text-[var(--accent-gold)]">₹{act.cost_estimate.toLocaleString()}</span>
                        </div>
                        {act.description && (
                          <p className="text-xs text-[var(--text-muted)] mt-1.5 line-clamp-2">{act.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => addActivity(act)}
                        className="shrink-0 px-2 py-1 rounded-lg text-xs btn-gold opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        + Add
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Mini Globe */}
        <div className="w-72 shrink-0 border-l border-[var(--glass-border)] bg-[var(--bg-mid)] flex flex-col">
          <div className="p-4 border-b border-[var(--glass-border)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Route Map</h2>
          </div>
          <div className="flex-1">
            <Globe pins={globePins} arcs={globeArcs} showNumbers height="100%" />
          </div>
          {globeArcs.length > 0 && (
            <div className="p-3 border-t border-[var(--glass-border)] text-center">
              <p className="text-xs text-[var(--text-muted)]">
                ✈ {globeArcs.length} route{globeArcs.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Stop Modal */}
      <Modal open={addStopOpen} onClose={() => setAddStopOpen(false)} title="Add City Stop" size="md">
        <div className="p-5">
          <input
            autoFocus
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            placeholder="Search cities... (or browse all below)"
            className="w-full bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-gold)] mb-3"
          />
          <p className="text-xs text-[var(--text-muted)] mb-3">
            {citiesLoading ? 'Loading cities…' : `${searchCities.length} cities available`}
          </p>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {citiesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-xl" />
              ))
            ) : searchCities.length === 0 ? (
              <p className="text-center text-[var(--text-muted)] text-sm py-6">No cities found</p>
            ) : (
              searchCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => addStop(city)}
                  className="w-full flex items-center gap-3 p-3 glass rounded-xl hover:border-[var(--accent-gold)] border border-transparent transition-all text-left group"
                >
                  {city.cover_image_url ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <img src={city.cover_image_url} alt={city.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-teal)] flex items-center justify-center text-lg shrink-0">🌍</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{city.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{city.country} · {city.region} · Cost {city.cost_index}/100</p>
                  </div>
                  <span className="text-xs text-[var(--accent-gold)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">+ Add</span>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
