import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertTriangle, TrendingUp, Wand2 } from 'lucide-react'
import { BudgetDonut } from '@/features/budget/BudgetDonut'
import { CurrencyToggle, useFormatCurrency } from '@/components/CurrencyToggle'
import { ProgressBar } from '@/components/ProgressBar'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface BudgetData {
  id: string; transport: number; stay: number; activities: number; meals: number; misc: number; total_limit: number;
}

const CATEGORIES = [
  { key: 'transport', label: 'Transport', emoji: '✈️' },
  { key: 'stay', label: 'Stay', emoji: '🏨' },
  { key: 'activities', label: 'Activities', emoji: '🎯' },
  { key: 'meals', label: 'Meals', emoji: '🍜' },
  { key: 'misc', label: 'Misc', emoji: '🛍️' },
] as const

export default function Budget() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fmt = useFormatCurrency()
  const [trip, setTrip] = useState<any>(null)
  const [budget, setBudget] = useState<BudgetData | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<BudgetData>>({})

  useEffect(() => {
    if (!id) return
    async function load() {
      const [tripRes, budgetRes] = await Promise.all([
        supabase.from('trips').select('name, total_budget').eq('id', id!).single(),
        supabase.from('budgets').select('*').eq('trip_id', id!).single(),
      ])
      if (tripRes.data) setTrip(tripRes.data)
      if (budgetRes.data) { setBudget(budgetRes.data); setForm(budgetRes.data) }
    }
    load()
  }, [id])

  async function saveBudget() {
    if (!budget?.id) return
    const { error } = await supabase.from('budgets').update(form).eq('id', budget.id)
    if (error) { toast.error('Failed to save'); return }
    setBudget({ ...budget, ...form } as BudgetData)
    setEditing(false)
    toast.success('Budget saved!')
  }

  const spent = CATEGORIES.reduce((t, c) => t + Number((form as any)[c.key] ?? 0), 0)
  const limit = Number(form.total_limit ?? 0)
  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0
  const over = spent > limit && limit > 0

  const donutSegments = CATEGORIES.map((c) => ({
    label: c.label,
    value: Number((form as any)[c.key] ?? 0),
  })).filter((s) => s.value > 0)

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pt-16">
      {/* Header */}
      <div className="glass-strong border-b border-[var(--glass-border)] px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(`/trips/${id}`)} className="w-8 h-8 glass rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl text-[var(--text-primary)]">{trip?.name} — Budget</h1>
          </div>
          <CurrencyToggle />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Alert */}
        {over && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-6">
            <AlertTriangle size={20} className="text-amber-400 shrink-0" />
            <p className="text-amber-400 text-sm font-medium">
              Budget exceeded by {fmt(spent - limit)}! Consider adjusting your spending.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 3D Donut */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-lg text-[var(--text-primary)] mb-4">Spending Breakdown</h2>
            {donutSegments.length > 0 ? (
              <BudgetDonut segments={donutSegments} />
            ) : (
              <div className="h-52 flex items-center justify-center text-[var(--text-muted)] text-sm">
                Enter budget amounts to see chart
              </div>
            )}
            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {CATEGORIES.map((c, i) => {
                const colors = ['#E0DDAA', '#1D546D', '#5F9598', '#8a9aaa', '#0f2d40']
                return (
                  <div key={c.key} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: colors[i] }} />
                    <span className="text-xs text-[var(--text-muted)]">{c.emoji} {c.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg text-[var(--text-primary)]">Summary</h2>
              <div className="flex gap-2">
                {!editing && trip?.total_budget > 0 && (
                  <button
                    onClick={() => {
                      const b = Number(trip.total_budget)
                      setForm((f) => ({ ...f,
                        transport: Math.round(b * 0.25),
                        stay: Math.round(b * 0.35),
                        meals: Math.round(b * 0.20),
                        activities: Math.round(b * 0.15),
                        misc: Math.round(b * 0.05),
                        total_limit: b,
                      }))
                      setEditing(true)
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-[var(--accent-teal)] text-[var(--accent-sage)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors"
                  >
                    <Wand2 size={11} /> Auto-distribute
                  </button>
                )}
                <button
                  onClick={() => editing ? saveBudget() : setEditing(true)}
                  className={editing ? 'btn-gold px-4 py-1.5 rounded-lg text-xs font-medium' : 'btn-teal px-4 py-1.5 rounded-lg text-xs'}
                >
                  {editing ? 'Save' : 'Edit'}
                </button>
              </div>
            </div>

            <div className="mb-5">
              <div className="flex items-end justify-between mb-2">
                <span className="text-sm text-[var(--text-muted)]">Total Spent</span>
                <span className={`font-display text-2xl ${over ? 'text-amber-400' : 'text-[var(--accent-gold)]'}`}>
                  {fmt(spent)}
                </span>
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-xs text-[var(--text-muted)]">Budget Limit</span>
                <span className="text-sm text-[var(--text-primary)]">{fmt(limit)}</span>
              </div>
              <ProgressBar value={pct} max={100} color={over ? 'sage' : 'gold'} className="mt-2" />
              <p className="text-xs text-[var(--text-muted)] text-right mt-1">{pct.toFixed(0)}% used</p>
            </div>

            {/* Daily avg */}
            {trip?.total_budget && (
              <div className="flex items-center gap-2 p-3 bg-[var(--bg-surface)] rounded-xl">
                <TrendingUp size={14} className="text-[var(--accent-sage)]" />
                <span className="text-xs text-[var(--text-muted)]">Avg per day estimate:</span>
                <span className="text-xs text-[var(--accent-gold)] font-medium">{fmt(spent / 7)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-[var(--glass-border)]">
            <h2 className="font-display text-lg text-[var(--text-primary)]">Category Breakdown</h2>
          </div>
          <div className="divide-y divide-[var(--glass-border)]">
            {CATEGORIES.map((cat) => (
              <div key={cat.key} className="flex items-center gap-4 px-5 py-4">
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-sm text-[var(--text-primary)] flex-1">{cat.label}</span>
                {editing ? (
                  <input
                    type="number"
                    value={(form as any)[cat.key] ?? 0}
                    onChange={(e) => setForm((f) => ({ ...f, [cat.key]: Number(e.target.value) }))}
                    className="w-32 bg-[var(--bg-surface)] border border-[var(--accent-teal)] rounded-lg px-3 py-1.5 text-right text-sm text-[var(--text-primary)] outline-none"
                  />
                ) : (
                  <span className="text-sm font-medium text-[var(--accent-gold)]">
                    {fmt(Number((budget as any)?.[cat.key] ?? 0))}
                  </span>
                )}
              </div>
            ))}
            {editing && (
              <div className="flex items-center gap-4 px-5 py-4 bg-[var(--bg-surface)]">
                <span className="text-xl">🎯</span>
                <span className="text-sm text-[var(--text-primary)] flex-1">Budget Limit</span>
                <input
                  type="number"
                  value={form.total_limit ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, total_limit: Number(e.target.value) }))}
                  className="w-32 bg-[var(--bg-mid)] border border-[var(--accent-gold)] rounded-lg px-3 py-1.5 text-right text-sm text-[var(--text-primary)] outline-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
