import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Clock, Tag, Check, SlidersHorizontal } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'
import type { Database } from '@/lib/supabase'

type Activity = Database['public']['Tables']['activities']['Row'] & {
  cities?: { name: string } | null
}

const CATEGORIES = ['all', 'adventure', 'culture', 'food', 'nightlife', 'nature', 'shopping', 'wellness']
const CATEGORY_COLORS: Record<string, string> = {
  adventure: 'text-orange-400 bg-orange-400/10',
  culture: 'text-yellow-400 bg-yellow-400/10',
  food: 'text-green-400 bg-green-400/10',
  nightlife: 'text-purple-400 bg-purple-400/10',
  nature: 'text-emerald-400 bg-emerald-400/10',
  shopping: 'text-pink-400 bg-pink-400/10',
  wellness: 'text-blue-400 bg-blue-400/10',
}

export default function ActivitySearch() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [maxCost, setMaxCost] = useState(50000)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      let q = supabase.from('activities').select('*, cities(name)').lte('cost_estimate', maxCost)
      if (category !== 'all') q = q.eq('category', category)
      if (query) q = q.ilike('name', `%${query}%`)
      const { data } = await q.order('cost_estimate').limit(60)
      setActivities((data as Activity[]) ?? [])
      setLoading(false)
    }
    fetch()
  }, [category, maxCost, query])

  function handleAdd(id: string) {
    setAdded((prev) => new Set([...prev, id]))
    setTimeout(() => setAdded((prev) => { const n = new Set(prev); n.delete(id); return n }), 2000)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-3xl text-[var(--text-primary)] mb-6">Browse Activities</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="glass rounded-2xl p-5 space-y-6 sticky top-24">
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1 mb-3">
                  <Tag size={12} /> Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${category === c ? 'bg-[var(--accent-gold)] text-[var(--bg-deep)] font-medium' : 'glass text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1 mb-3">
                  <SlidersHorizontal size={12} /> Max Cost: ₹{maxCost.toLocaleString()}
                </label>
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={1000}
                  value={maxCost}
                  onChange={(e) => setMaxCost(Number(e.target.value))}
                  className="w-full accent-[var(--accent-gold)]"
                />
                <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                  <span>₹0</span><span>₹1,00,000</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Activity grid */}
          <div className="flex-1">
            <div className="relative mb-5">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search activities..."
                className="w-full bg-[var(--bg-mid)] border border-[var(--glass-border)] rounded-xl pl-11 pr-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-gold)]"
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activities.map((act, i) => (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}
                    className="glass rounded-2xl p-4 group relative"
                  >
                    {act.image_url && (
                      <div className="h-24 rounded-xl bg-cover bg-center mb-3" style={{ backgroundImage: `url(${act.image_url})` }} />
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{act.name}</h3>
                        {act.cities?.name && (
                          <p className="text-xs text-[var(--text-muted)] mb-1.5">{act.cities.name}</p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[act.category] ?? ''}`}>
                            {act.category}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            <Clock size={10} className="inline mr-0.5" />{act.duration_hours}h
                          </span>
                          <span className="text-xs text-[var(--accent-gold)] font-medium">
                            ₹{act.cost_estimate.toLocaleString()}
                          </span>
                        </div>
                        {act.description && (
                          <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-2">{act.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdd(act.id)}
                      className={`mt-3 w-full py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                        added.has(act.id)
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'btn-gold'
                      }`}
                    >
                      {added.has(act.id) ? <><Check size={12} /> Added!</> : '+ Add to Trip'}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
