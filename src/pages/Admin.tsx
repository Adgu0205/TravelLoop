import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Map, Activity, DollarSign, TrendingUp, Search } from 'lucide-react'
import { BarChart3D } from '@/features/admin/BarChart3D'
import { supabase } from '@/lib/supabase'

interface KPI { users: number; trips: number; publicTrips: number; avgBudget: number }

// ── Activity Heatmap ────────────────────────────────────────────────────────
function ActivityHeatmap({ trips }: { trips: any[] }) {
  const today = new Date()
  // Build 365-day map of counts
  const countMap: Record<string, number> = {}
  for (const t of trips) {
    if (!t.created_at) continue
    const day = t.created_at.slice(0, 10)
    countMap[day] = (countMap[day] ?? 0) + 1
  }

  // 52 weeks × 7 days grid, ending today
  const weeks: Date[][] = []
  const end = new Date(today)
  end.setDate(end.getDate() - end.getDay()) // align to Sunday
  for (let w = 51; w >= 0; w--) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(end)
      date.setDate(end.getDate() - w * 7 + d)
      week.push(date)
    }
    weeks.push(week)
  }

  const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const maxCount = Math.max(1, ...Object.values(countMap))

  function cellColor(iso: string) {
    const c = countMap[iso] ?? 0
    if (c === 0) return 'var(--bg-surface)'
    const intensity = c / maxCount
    if (intensity < 0.25) return 'rgba(196,134,42,0.25)'
    if (intensity < 0.5) return 'rgba(196,134,42,0.5)'
    if (intensity < 0.75) return 'rgba(196,134,42,0.75)'
    return 'var(--accent-gold)'
  }

  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="font-display text-lg text-[var(--text-primary)] mb-4">Trip Activity (Past Year)</h2>
      <div className="overflow-x-auto">
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          {/* Day labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 18 }}>
            {['','Mo','','We','','Fr',''].map((d, i) => (
              <div key={i} style={{ height: 12, fontSize: 9, color: 'var(--text-muted)', lineHeight: '12px', width: 16, textAlign: 'right' }}>{d}</div>
            ))}
          </div>
          <div>
            {/* Month labels */}
            <div style={{ display: 'flex', marginBottom: 4 }}>
              {weeks.map((week, wi) => {
                const first = week.find((d) => d.getDate() === 1)
                return (
                  <div key={wi} style={{ width: 15, fontSize: 9, color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {first ? MONTH_LABELS[first.getMonth()] : ''}
                  </div>
                )
              })}
            </div>
            {/* Grid */}
            <div style={{ display: 'flex', gap: 3 }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {week.map((date) => {
                    const iso = date.toISOString().slice(0, 10)
                    const count = countMap[iso] ?? 0
                    return (
                      <div
                        key={iso}
                        title={`${iso}: ${count} trip${count !== 1 ? 's' : ''}`}
                        style={{
                          width: 12, height: 12,
                          borderRadius: 2,
                          background: cellColor(iso),
                          transition: 'background 0.2s',
                          cursor: count > 0 ? 'pointer' : 'default',
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <div key={v} style={{ width: 12, height: 12, borderRadius: 2, background: v === 0 ? 'var(--bg-surface)' : `rgba(196,134,42,${v})` }} />
          ))}
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>More</span>
        </div>
      </div>
    </div>
  )
}
// ───────────────────────────────────────────────────────────────────────────

export default function Admin() {
  const [kpi, setKpi] = useState<KPI>({ users: 0, trips: 0, publicTrips: 0, avgBudget: 0 })
  const [topCities, setTopCities] = useState<{ name: string; count: number }[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [allTrips, setAllTrips] = useState<any[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Simulated weekly bar data
  const weekBars = [
    { label: 'Mon', value: 4 }, { label: 'Tue', value: 7 }, { label: 'Wed', value: 5 },
    { label: 'Thu', value: 9 }, { label: 'Fri', value: 12 }, { label: 'Sat', value: 8 },
    { label: 'Sun', value: 6 },
  ]

  useEffect(() => {
    async function load() {
      const [usersRes, tripsRes, budgetsRes, stopsRes, recentUsersRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('trips').select('id,is_public,created_at', { count: 'exact' }),
        supabase.from('budgets').select('total_limit'),
        supabase.from('stops').select('city_id, cities(name)'),
        supabase.from('users').select('id,name,email,created_at').order('created_at', { ascending: false }).limit(20),
      ])

      setAllTrips(tripsRes.data ?? [])
      const trips = tripsRes.data ?? []
      const budgets = budgetsRes.data ?? []
      const avgBudget = budgets.length > 0 ? budgets.reduce((s, b) => s + Number(b.total_limit), 0) / budgets.length : 0

      setKpi({
        users: usersRes.count ?? 0,
        trips: tripsRes.count ?? 0,
        publicTrips: trips.filter((t) => t.is_public).length,
        avgBudget,
      })

      // Top cities from stops
      const cityCount: Record<string, number> = {}
      for (const stop of (stopsRes.data ?? []) as any[]) {
        const name = stop.cities?.name
        if (name) cityCount[name] = (cityCount[name] ?? 0) + 1
      }
      const sorted = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 10)
      setTopCities(sorted.map(([name, count]) => ({ name, count })))

      setRecentUsers(recentUsersRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filteredUsers = recentUsers.filter((u) =>
    userSearch === '' || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())
  )

  const KPICard = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) => (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent-teal)]/20 flex items-center justify-center">
          <Icon size={18} className="text-[var(--accent-gold)]" />
        </div>
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-display text-3xl text-[var(--text-primary)]">{value}</p>
      {sub && <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pt-16">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 min-h-[calc(100vh-64px)] border-r border-[var(--glass-border)] bg-[var(--bg-mid)] p-4 hidden lg:block">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-4 px-2">Admin Panel</p>
          {[
            { label: 'Overview', icon: TrendingUp },
            { label: 'Users', icon: Users },
            { label: 'Trips', icon: Map },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(29,84,109,0.2)] cursor-pointer transition-colors mb-1">
              <Icon size={14} /> {label}
            </div>
          ))}
        </aside>

        {/* Main */}
        <div className="flex-1 p-6 overflow-auto">
          <h1 className="font-display text-2xl text-[var(--text-primary)] mb-6">Admin Dashboard</h1>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard icon={Users} label="Total Users" value={kpi.users} />
            <KPICard icon={Map} label="Trips Created" value={kpi.trips} />
            <KPICard icon={Activity} label="Public Trips" value={kpi.publicTrips} />
            <KPICard icon={DollarSign} label="Avg Budget" value={kpi.avgBudget > 0 ? `₹${Math.round(kpi.avgBudget).toLocaleString()}` : '—'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 3D Bar Chart */}
            <div className="glass rounded-2xl p-5">
              <h2 className="font-display text-lg text-[var(--text-primary)] mb-4">Trips per Day (This Week)</h2>
              <BarChart3D bars={weekBars} />
              <div className="flex justify-between mt-2">
                {weekBars.map((b) => (
                  <span key={b.label} className="text-xs text-[var(--text-muted)] flex-1 text-center">{b.label}</span>
                ))}
              </div>
            </div>

            {/* Top cities */}
            <div className="glass rounded-2xl p-5">
              <h2 className="font-display text-lg text-[var(--text-primary)] mb-4">Top 10 Cities</h2>
              {topCities.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm">No stops data yet</p>
              ) : (
                <div className="space-y-2">
                  {topCities.map((city, i) => (
                    <div key={city.name} className="flex items-center gap-3">
                      <span className="text-xs text-[var(--text-muted)] w-5">{i + 1}</span>
                      <span className="text-sm text-[var(--text-primary)] flex-1">{city.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--accent-gold)] rounded-full" style={{ width: `${(city.count / (topCities[0]?.count ?? 1)) * 100}%` }} />
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">{city.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity Heatmap */}
          <ActivityHeatmap trips={allTrips} />

          {/* User table */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[var(--glass-border)] flex items-center gap-4">
              <h2 className="font-display text-lg text-[var(--text-primary)] flex-1">Users</h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-lg pl-8 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-gold)] w-48"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--glass-border)]">
                    {['Name', 'Email', 'Joined'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-[var(--glass-border)]/50 hover:bg-[rgba(29,84,109,0.1)] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent-teal)] to-[var(--accent-sage)] flex items-center justify-center text-xs font-semibold">
                            {u.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <span className="text-[var(--text-primary)]">{u.name ?? 'Unnamed'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[var(--text-muted)]">{u.email}</td>
                      <td className="px-5 py-3 text-[var(--text-muted)]">{new Date(u.created_at).toLocaleDateString()}</td>
                    </motion.tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-[var(--text-muted)]">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
