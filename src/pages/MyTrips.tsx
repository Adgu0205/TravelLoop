import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Calendar, MapPin, Trash2, ExternalLink, Globe, Compass } from 'lucide-react'
import { TiltCard } from '@/components/TiltCard'
import { TripCardSkeleton } from '@/components/Skeleton'
import { useTrips } from '@/hooks/useTrips'
import { useFormatCurrency } from '@/components/CurrencyToggle'

type Filter = 'all' | 'upcoming' | 'past' | 'draft'

export default function MyTrips() {
  const navigate = useNavigate()
  const { trips, deleteTrip } = useTrips()
  const fmt = useFormatCurrency()
  const [filter, setFilter] = useState<Filter>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const filtered = trips.filter((t) => {
    if (filter === 'upcoming') return t.start_date && t.start_date >= today
    if (filter === 'past') return t.end_date && t.end_date < today
    if (filter === 'draft') return !t.start_date
    return true
  })

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this trip? This cannot be undone.')) return
    setDeleting(id)
    await deleteTrip(id)
    setDeleting(null)
  }

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'draft', label: 'Draft' },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-[var(--text-primary)]">My Trips</h1>
            <p className="text-[var(--text-muted)] text-sm mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''} total</p>
          </div>
          <button
            onClick={() => navigate('/trips/new')}
            className="btn-gold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold"
          >
            <Plus size={16} /> New Trip
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === key
                  ? 'bg-[var(--accent-gold)] text-[var(--bg-deep)]'
                  : 'glass text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl"
            style={{ background: 'var(--bg-mid)', border: '1px solid var(--glass-border)' }}>
            <Compass size={48} className="mb-5 opacity-30" style={{ color: 'var(--accent-teal)' }} />
            <h2 className="font-display text-xl text-[var(--text-primary)] mb-2">No trips yet</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Plan your first adventure</p>
            <button onClick={() => navigate('/trips/new')} className="btn-gold px-5 py-2.5 rounded-xl text-sm">
              Start Planning
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>
            No {filter} trips
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl overflow-hidden cursor-pointer group"
                style={{ background: 'var(--bg-mid)', border: '1px solid var(--glass-border)' }}
                onClick={() => navigate(`/trips/${trip.id}`)}
              >
                {/* Cover */}
                <div className="relative h-40 bg-cover bg-center overflow-hidden"
                  style={{
                    backgroundImage: trip.cover_photo_url
                      ? `url(${trip.cover_photo_url})`
                      : `linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-sage) 100%)`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Hover actions */}
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => handleDelete(trip.id, e)}
                      disabled={deleting === trip.id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/40 backdrop-blur-sm text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      {deleting === trip.id
                        ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                        : <Trash2 size={12} />}
                    </button>
                  </div>

                  {trip.is_public && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                      style={{ background: 'var(--accent-gold)', color: 'var(--bg-deep)' }}>
                      Public
                    </span>
                  )}

                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-display text-base text-white leading-tight truncate">{trip.name}</h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  {trip.description && (
                    <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>{trip.description}</p>
                  )}
                  <div className="flex items-center justify-between gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {(trip.start_date || trip.end_date) ? (
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {trip.start_date ?? '?'} → {trip.end_date ?? '?'}
                      </span>
                    ) : <span>No dates</span>}
                    <span className="font-semibold" style={{ color: 'var(--accent-gold)' }}>
                      {fmt(Number(trip.total_budget))}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/trips/${trip.id}/build`) }}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-gold)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    Itinerary
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/trips/${trip.id}/budget`) }}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-gold)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    Budget
                  </button>
                  {trip.is_public && (
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/share/${trip.share_token}`) }}
                      className="py-1.5 px-2.5 rounded-lg transition-colors"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                    >
                      <ExternalLink size={11} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
