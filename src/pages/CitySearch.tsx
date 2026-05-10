import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Star, DollarSign, MapPin, Globe, X } from 'lucide-react'
import { TiltCard } from '@/components/TiltCard'
import { useCities } from '@/hooks/useCities'
import type { Database } from '@/lib/supabase'

type City = Database['public']['Tables']['cities']['Row']

const REGIONS = ['All', 'Asia', 'Europe', 'Americas', 'Africa', 'Middle East', 'Oceania']

function CityCard({ city }: { city: City }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <TiltCard intensity={8}>
      <div className="flip-card h-72" onClick={() => setFlipped(!flipped)}>
        <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="flip-card-front glass overflow-hidden cursor-pointer">
            <div
              className="h-44 bg-cover bg-center relative"
              style={{ backgroundImage: city.cover_image_url ? `url(${city.cover_image_url})` : 'none' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="font-display text-xl text-[var(--text-primary)]">{city.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">{city.country}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={10} fill={i < Math.round(city.popularity_score / 20) ? 'var(--accent-gold)' : 'none'} stroke="var(--accent-gold)" />
                  ))}
                </div>
                <span className="text-xs px-2 py-1 bg-[var(--bg-surface)] rounded-full text-[var(--accent-sage)]">
                  {city.region}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2 text-right">Tap to flip →</p>
            </div>
          </div>

          {/* Back */}
          <div className="flip-card-back glass p-5 flex flex-col justify-between cursor-pointer">
            <div>
              <h3 className="font-display text-xl text-[var(--text-primary)] mb-1">{city.name}</h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">{city.country}, {city.region}</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1 flex items-center gap-1">
                    <DollarSign size={10} /> Cost Index
                  </p>
                  <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent-gold)] rounded-full" style={{ width: `${city.cost_index}%` }} />
                  </div>
                  <p className="text-xs text-[var(--accent-gold)] mt-0.5">{city.cost_index}/100</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1 flex items-center gap-1">
                    <Star size={10} /> Popularity
                  </p>
                  <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent-sage)] rounded-full" style={{ width: `${city.popularity_score}%` }} />
                  </div>
                  <p className="text-xs text-[var(--accent-sage)] mt-0.5">{city.popularity_score}/100</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <MapPin size={10} />
              <span>{city.lat.toFixed(2)}°N, {city.lng.toFixed(2)}°E</span>
            </div>
          </div>
        </div>
      </div>
    </TiltCard>
  )
}

export default function CitySearch() {
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [region, setRegion] = useState('All')
  const { cities, loading } = useCities(query, region === 'All' ? '' : region)

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl text-[var(--text-primary)] mb-1">Explore Destinations</h1>
          <p className="text-[var(--text-muted)] text-sm">Discover {cities.length} amazing cities. Click a card to reveal details.</p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cities..."
              className="w-full bg-[var(--bg-mid)] border border-[var(--glass-border)] rounded-xl pl-11 pr-10 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-gold)] transition-colors"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {REGIONS.map((r) => (
              <button key={r} onClick={() => setRegion(r)} className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${region === r ? 'bg-[var(--accent-gold)] text-[var(--bg-deep)] font-medium' : 'glass text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <Globe size={48} className="mx-auto mb-4 text-[var(--accent-teal)]" />
            <p>No cities found for "{query}"</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {cities.map((city, i) => (
              <motion.div key={city.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <CityCard city={city} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
