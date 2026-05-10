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
          <div className="flex flex-col items-center justify-center py-24 glass rounded-2xl">
            <Compass size={64} className="text-[var(--accent-teal)] mb-6 animate-float-up" />
            <h2 className="font-display text-2xl text-[var(--text-primary)] mb-2">No trips yet</h2>
            <p className="text-[var(--text-muted)] mb-6">Create your first adventure and see it on the globe</p>
            <button onClick={() => navigate('/trips/new')} className="btn-gold px-6 py-3 rounded-xl">
              Start Planning
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)]">
            No {filter} trips found
          </div>
        ) : (
          <div className="masonry">
            {filtered.map((trip, i) => (
              <TiltCard key={trip.id} intensity={6}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => navigate(`/trips/${trip.id}`)}
                >
                  {/* Cover */}
                  <div
                    className="relative bg-cover bg-center"
                    style={{
                      height: i % 3 === 0 ? 200 : 160,
                      backgroundImage: trip.cover_photo_url
                        ? `url(${trip.cover_photo_url})`
                        : `linear-gradient(135deg, var(--bg-surface) 0%, var(--accent-teal) 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)]/90 to-transparent" />
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {trip.is_public && (
                        <div className="glass rounded-lg p-1.5">
                          <Globe size={12} className="text-[var(--accent-gold)]" />
                        </div>
                      )}
                      <button
                        onClick={(e) => handleDelete(trip.id, e)}
                        disabled={deleting === trip.id}
                        className="glass rounded-lg p-1.5 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        {deleting === trip.id
                          ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 size={12} />
                        }
                      </button>
                    </div>
                    {trip.is_public && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-[var(--accent-gold)] text-[var(--bg-deep)] text-xs rounded-full font-medium">
                        Public
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-display text-base text-[var(--text-primary)] mb-1 truncate">{trip.name}</h3>
                    {trip.description && (
                      <p className="text-xs text-[var(--text-muted)] mb-2 line-clamp-2">{trip.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(trip.start_date || trip.end_date) && (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-[var(--bg-surface)] rounded-full text-[var(--text-muted)]">
                          <Calendar size={10} />
                          {trip.start_date ?? '?'} → {trip.end_date ?? '?'}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs px-2 py-1 bg-[var(--bg-surface)] rounded-full text-[var(--accent-sage)]">
                        {fmt(Number(trip.total_budget))}
                      </span>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}/build`) }}
                      className="flex-1 py-2 rounded-lg text-xs glass text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
                    >
                      Edit Itinerary
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}/budget`) }}
                      className="flex-1 py-2 rounded-lg text-xs glass text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
                    >
                      Budget
                    </button>
                    {trip.is_public && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/share/${trip.share_token}`) }}
                        className="py-2 px-3 rounded-lg glass text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
                      >
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
