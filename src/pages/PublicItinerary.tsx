import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Share2, Copy, Globe, Clock, DollarSign, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function PublicItinerary() {
  const { token } = useParams<{ token: string }>()
  const [trip, setTrip] = useState<any>(null)
  const [stops, setStops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) return
    async function load() {
      const tripRes = await supabase.from('trips').select('*').eq('share_token', token).eq('is_public', true).single()
      if (!tripRes.data) { setNotFound(true); setLoading(false); return }
      setTrip(tripRes.data)
      const stopsRes = await supabase
        .from('stops')
        .select('*, cities(name,country,lat,lng,cover_image_url), stop_activities(id,scheduled_time,cost_override,activities(name,category,cost_estimate,duration_hours))')
        .eq('trip_id', tripRes.data.id)
        .order('position_order')
      setStops(stopsRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [token])

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my trip: ${trip?.name} ${window.location.href}`)}`)
  }

  function shareTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Planning ${trip?.name} with Traveloop! ${window.location.href}`)}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-[var(--accent-teal)] border-t-[var(--accent-gold)] animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-[var(--bg-deep)] flex flex-col items-center justify-center gap-4">
      <Globe size={48} className="text-[var(--accent-teal)]" />
      <h1 className="font-display text-2xl text-[var(--text-primary)]">Itinerary not found</h1>
      <p className="text-[var(--text-muted)]">This link may have expired or the trip is private.</p>
    </div>
  )

  const totalActivities = stops.reduce((t: number, s: any) => t + (s.stop_activities?.length ?? 0), 0)

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      {/* Hero */}
      <div
        className="relative h-80 bg-cover bg-center"
        style={{
          backgroundImage: stops[0]?.cities?.cover_image_url
            ? `url(${stops[0].cities.cover_image_url})`
            : `linear-gradient(135deg, var(--bg-mid), var(--accent-teal))`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-[var(--bg-deep)]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-3xl mx-auto">
            <p className="text-[var(--accent-gold)] text-xs uppercase tracking-widest mb-2">Traveloop Itinerary</p>
            <h1 className="font-display text-4xl text-[var(--text-primary)] mb-2">{trip?.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><MapPin size={12} /> {stops.length} stops</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {totalActivities} activities</span>
              {trip?.total_budget > 0 && <span className="flex items-center gap-1"><DollarSign size={12} /> ₹{Number(trip.total_budget).toLocaleString()}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button onClick={copyLink} className="btn-gold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
            <Copy size={14} /> Copy this Trip
          </button>
          <button onClick={shareWhatsApp} className="btn-teal px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
            <Share2 size={14} /> WhatsApp
          </button>
          <button onClick={shareTwitter} className="btn-teal px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
            <Share2 size={14} /> Twitter / X
          </button>
        </div>

        {/* Timeline */}
        {stops.map((stop: any, i: number) => (
          <motion.div key={stop.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="mb-10">
            {/* City hero */}
            {stop.cities?.cover_image_url && (
              <div className="h-48 rounded-2xl bg-cover bg-center mb-4 relative overflow-hidden" style={{ backgroundImage: `url(${stop.cities.cover_image_url})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)]/80 to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <h2 className="font-display text-2xl text-[var(--text-primary)]">{stop.cities.name}</h2>
                  <p className="text-[var(--text-muted)] text-sm">{stop.cities.country}</p>
                </div>
              </div>
            )}

            {/* Activities */}
            {stop.stop_activities?.length > 0 && (
              <div className="glass rounded-2xl overflow-hidden">
                {stop.stop_activities.map((sa: any) => (
                  <div key={sa.id} className="flex items-start gap-3 p-4 border-b border-[var(--glass-border)] last:border-0">
                    {sa.scheduled_time && <span className="text-xs text-[var(--text-muted)] shrink-0 pt-0.5">{sa.scheduled_time}</span>}
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{sa.activities?.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                        {sa.activities?.duration_hours && <span>{sa.activities.duration_hours}h</span>}
                        <span className="text-[var(--accent-gold)]">₹{(sa.cost_override ?? sa.activities?.cost_estimate ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}

        {/* Watermark */}
        <div className="text-center py-6 border-t border-[var(--glass-border)]">
          <p className="text-[var(--text-muted)] text-sm flex items-center justify-center gap-2">
            <Globe size={14} className="text-[var(--accent-gold)]" /> Made with <strong className="text-[var(--accent-gold)]">Traveloop</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
