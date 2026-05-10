import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Check, Upload, Calendar, Users, Plane,
  MapPin, Plus, X, RotateCcw, ChevronRight,
} from 'lucide-react'
import { DatePicker } from '@/components/DatePicker'
import { tripSchema } from '@/lib/schemas'
import type { z } from 'zod'
type TripFormInput = z.input<typeof tripSchema>
import { useTrips } from '@/hooks/useTrips'
import { useCities } from '@/hooks/useCities'
import { ProgressBar } from '@/components/ProgressBar'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { Database } from '@/lib/supabase'

type TripInput = z.infer<typeof tripSchema>
type City = Database['public']['Tables']['cities']['Row']

const STEPS = ['Details', 'Route', 'Dates', 'Budget']

// ── City Search Dropdown ───────────────────────────────────────────────────
function CityPicker({
  value, onChange, placeholder,
}: { value: City | null; onChange: (c: City) => void; placeholder: string }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const { cities, loading } = useCities(query)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  if (value) {
    return (
      <div className="flex items-center gap-3 p-3 glass rounded-xl border border-[var(--accent-gold)]/40">
        {value.cover_image_url && (
          <img src={value.cover_image_url} alt={value.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{value.name}</p>
          <p className="text-xs text-[var(--text-muted)]">{value.country}</p>
        </div>
        <button onClick={() => onChange(null as any)} className="text-[var(--text-muted)] hover:text-red-400 transition-colors">
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-gold)] transition-colors text-sm"
      />
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 glass-strong rounded-xl border border-[var(--glass-border)] shadow-xl max-h-56 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-xs text-[var(--text-muted)] text-center">Loading…</div>
          ) : cities.length === 0 ? (
            <div className="p-4 text-xs text-[var(--text-muted)] text-center">No cities found</div>
          ) : cities.map((city) => (
            <button
              key={city.id}
              onMouseDown={() => { onChange(city); setQuery(''); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--accent-teal)]/20 transition-colors text-left"
            >
              {city.cover_image_url
                ? <img src={city.cover_image_url} alt={city.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                : <div className="w-8 h-8 rounded-lg bg-[var(--accent-teal)] flex items-center justify-center text-sm shrink-0">🌍</div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)]">{city.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{city.country} · {city.region}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Route Step ────────────────────────────────────────────────────────────
interface RouteState {
  origin: City | null
  midStops: City[]
  destination: City | null
  returnTrip: boolean
}

function StepRoute({ route, setRoute }: { route: RouteState; setRoute: (r: RouteState) => void }) {
  const allStops = [
    route.origin,
    ...route.midStops,
    route.destination,
    ...(route.returnTrip && route.origin ? [route.origin] : []),
  ].filter(Boolean) as City[]

  function removeMid(i: number) {
    setRoute({ ...route, midStops: route.midStops.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="space-y-4">
      {/* Visual route board */}
      {allStops.length >= 2 && (
        <div className="glass rounded-xl p-3 mb-2">
          <div className="flex items-center gap-1 flex-wrap">
            {allStops.map((city, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--accent-teal)]/20 border border-[var(--accent-teal)]/40">
                  <span className="text-xs">{i === 0 ? '🛫' : i === allStops.length - 1 ? '🛬' : '🔵'}</span>
                  <span className="text-xs font-medium text-[var(--text-primary)]">{city.name}</span>
                </div>
                {i < allStops.length - 1 && (
                  <div className="flex items-center gap-0.5 text-[var(--accent-gold)]">
                    <div className="w-4 border-t border-dashed border-[var(--accent-gold)]" />
                    <Plane size={10} className="shrink-0" />
                    <div className="w-4 border-t border-dashed border-[var(--accent-gold)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Departure */}
      <div>
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
          <span className="text-base">🛫</span> Departure City *
        </label>
        <CityPicker
          value={route.origin}
          onChange={(c) => setRoute({ ...route, origin: c })}
          placeholder="Search departure city…"
        />
      </div>

      {/* Mid stops */}
      {route.midStops.map((city, i) => (
        <div key={i}>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-px border-t border-dashed border-[var(--glass-border)]" />
            <span className="text-xs text-[var(--text-muted)] shrink-0">Stop {i + 1}</span>
            <div className="flex-1 h-px border-t border-dashed border-[var(--glass-border)]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <CityPicker
                value={city}
                onChange={(c) => {
                  const updated = [...route.midStops]
                  updated[i] = c
                  setRoute({ ...route, midStops: updated })
                }}
                placeholder="Search city…"
              />
            </div>
            <button
              onClick={() => removeMid(i)}
              className="w-9 h-9 rounded-xl glass flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}

      {/* Add mid stop */}
      <button
        onClick={() => setRoute({ ...route, midStops: [...route.midStops, null as any] })}
        className="w-full py-2.5 rounded-xl border border-dashed border-[var(--glass-border)] text-[var(--text-muted)] hover:border-[var(--accent-teal)] hover:text-[var(--text-primary)] transition-all text-sm flex items-center justify-center gap-2"
      >
        <Plus size={14} /> Add mid stop / layover
      </button>

      {/* Destination */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-px border-t border-dashed border-[var(--glass-border)]" />
          <span className="text-xs text-[var(--text-muted)] shrink-0">Destination</span>
          <div className="flex-1 h-px border-t border-dashed border-[var(--glass-border)]" />
        </div>
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
          <span className="text-base">🛬</span> Arrival City *
        </label>
        <CityPicker
          value={route.destination}
          onChange={(c) => setRoute({ ...route, destination: c })}
          placeholder="Search destination city…"
        />
      </div>

      {/* Return toggle */}
      <button
        onClick={() => setRoute({ ...route, returnTrip: !route.returnTrip })}
        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
          route.returnTrip
            ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10'
            : 'border-[var(--glass-border)] hover:border-[var(--accent-teal)]'
        }`}
      >
        <RotateCcw size={16} className={route.returnTrip ? 'text-[var(--accent-gold)]' : 'text-[var(--text-muted)]'} />
        <div className="text-left flex-1">
          <p className="text-sm text-[var(--text-primary)]">Return trip</p>
          <p className="text-xs text-[var(--text-muted)]">Add a stop back to {route.origin?.name ?? 'origin'}</p>
        </div>
        <div className={`w-9 h-5 rounded-full transition-colors ${route.returnTrip ? 'bg-[var(--accent-gold)]' : 'bg-[var(--bg-surface)]'} relative`}>
          <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${route.returnTrip ? 'left-4' : 'left-0.5'}`} />
        </div>
      </button>
    </div>
  )
}

// ── Step 3 — Dates ────────────────────────────────────────────────────────
function StepDates({ form }: { form: any }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
            <Calendar size={12} className="inline mr-1" /> Start Date
          </label>
          <DatePicker
            value={form.watch('start_date') ?? ''}
            onChange={(v) => form.setValue('start_date', v)}
            label="Pick start date"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
            <Calendar size={12} className="inline mr-1" /> End Date
          </label>
          <DatePicker
            value={form.watch('end_date') ?? ''}
            onChange={(v) => form.setValue('end_date', v)}
            label="Pick end date"
            min={form.watch('start_date') ?? ''}
          />
        </div>
      </div>
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-[var(--accent-sage)]" />
          <span className="text-sm text-[var(--text-primary)]">Invite Collaborators</span>
        </div>
        <input
          type="email"
          placeholder="Enter email and press Enter…"
          className="w-full bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-gold)] transition-colors"
        />
        <p className="text-xs text-[var(--text-muted)] mt-2">Collaborators can view and edit this trip</p>
      </div>
    </div>
  )
}

// ── Step 4 — Budget ───────────────────────────────────────────────────────
function StepBudget({ form }: { form: any }) {
  const budget = form.watch('total_budget') ?? 0
  const categories = [
    { label: 'Transport', pct: 25, color: 'var(--accent-gold)' },
    { label: 'Stay', pct: 35, color: 'var(--accent-teal)' },
    { label: 'Food', pct: 20, color: 'var(--accent-sage)' },
    { label: 'Activities', pct: 15, color: '#8a9aaa' },
    { label: 'Misc', pct: 5, color: '#6b7a8a' },
  ]
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Total Budget (₹)</label>
        <input
          type="number"
          {...form.register('total_budget', { valueAsNumber: true })}
          placeholder="0"
          className="w-full bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-gold)] transition-colors text-2xl font-display"
        />
      </div>
      {Number(budget) > 0 && (
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-[var(--text-muted)] mb-3">Auto-distribution preview</p>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.label} className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-muted)] w-20">{cat.label}</span>
                <div className="flex-1 h-1.5 bg-[var(--bg-deep)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.pct}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full"
                    style={{ background: cat.color }}
                  />
                </div>
                <span className="text-xs text-[var(--text-primary)] w-14 text-right">
                  ₹{((Number(budget) * cat.pct) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Step 1 — Details ──────────────────────────────────────────────────────
function StepDetails({ form }: { form: any }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Trip Name *</label>
        <input
          {...form.register('name')}
          placeholder="e.g. Japan Cherry Blossom Tour"
          className="w-full bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-gold)] transition-colors"
        />
        {form.formState.errors.name && (
          <p className="text-red-400 text-xs mt-1">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Description</label>
        <textarea
          {...form.register('description')}
          placeholder="What's this trip about?"
          rows={3}
          className="w-full bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-gold)] transition-colors resize-none"
        />
      </div>
      <div>
        <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Cover Photo URL</label>
        <div className="flex gap-2">
          <input
            {...form.register('cover_photo_url')}
            placeholder="https://images.unsplash.com/…"
            className="flex-1 bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-gold)] transition-colors text-sm"
          />
          <div className="w-12 h-12 glass rounded-xl flex items-center justify-center border border-dashed border-[var(--accent-teal)] cursor-pointer hover:border-[var(--accent-gold)] transition-colors">
            <Upload size={16} className="text-[var(--text-muted)]" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────
export default function CreateTrip() {
  const navigate = useNavigate()
  const { createTrip } = useTrips()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [route, setRoute] = useState<RouteState>({
    origin: null,
    midStops: [],
    destination: null,
    returnTrip: false,
  })

  const form = useForm<TripFormInput>({
    resolver: zodResolver(tripSchema),
    defaultValues: { total_budget: 0 },
  })

  async function handleSubmit(data: TripFormInput) {
    setLoading(true)
    const trip = await createTrip(data as TripInput)
    if (!trip) { setLoading(false); return }

    // Build ordered city list from route
    const routeCities: City[] = [
      route.origin,
      ...route.midStops.filter(Boolean),
      route.destination,
      ...(route.returnTrip && route.origin ? [route.origin] : []),
    ].filter(Boolean) as City[]

    // Create stops in DB
    if (routeCities.length > 0) {
      const startDate = data.start_date
      const endDate = data.end_date
      const totalDays = (startDate && endDate)
        ? Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
        : null
      const daysPerCity = totalDays ? Math.floor(totalDays / routeCities.length) : null

      for (let i = 0; i < routeCities.length; i++) {
        const city = routeCities[i]
        let stopStart: string | null = null
        let stopEnd: string | null = null
        if (startDate && daysPerCity) {
          const s = new Date(startDate)
          s.setDate(s.getDate() + i * daysPerCity)
          stopStart = s.toISOString().slice(0, 10)
          const e = new Date(s)
          e.setDate(e.getDate() + daysPerCity - 1)
          stopEnd = e.toISOString().slice(0, 10)
        }
        await supabase.from('stops').insert({
          trip_id: trip.id,
          city_id: city.id,
          position_order: i,
          start_date: stopStart,
          end_date: stopEnd,
        })
      }
    }

    setLoading(false)
    navigate(`/trips/${trip.id}/build`)
  }

  function nextStep() {
    if (step === 0) {
      form.trigger(['name']).then((ok) => { if (ok) setStep(1) })
    } else if (step === 1) {
      if (!route.origin) { toast.error('Pick a departure city'); return }
      if (!route.destination) { toast.error('Pick a destination city'); return }
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else {
      form.handleSubmit(handleSubmit)()
    }
  }

  const stepLabels = ['Details', 'Route', 'Dates', 'Budget']

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pt-16 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-[var(--glass-border)]">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => step > 0 ? setStep(step - 1) : navigate('/trips')}
                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="font-display text-xl text-[var(--text-primary)]">New Trip</h1>
                <p className="text-xs text-[var(--text-muted)]">Step {step + 1} of {stepLabels.length}</p>
              </div>
            </div>
            <div className="flex gap-2 mb-3">
              {stepLabels.map((s, i) => (
                <div key={s} className="flex-1 flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    i < step ? 'bg-[var(--accent-gold)] text-[var(--bg-deep)]' :
                    i === step ? 'bg-[var(--accent-teal)] text-[var(--text-primary)]' :
                    'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                  }`}>
                    {i < step ? <Check size={12} /> : i + 1}
                  </div>
                  <span className={`text-xs ${i === step ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>{s}</span>
                </div>
              ))}
            </div>
            <ProgressBar value={step + 1} max={stepLabels.length} color="gold" />
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                {step === 0 && <StepDetails form={form} />}
                {step === 1 && <StepRoute route={route} setRoute={setRoute} />}
                {step === 2 && <StepDates form={form} />}
                {step === 3 && <StepBudget form={form} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <motion.button
              onClick={nextStep}
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-gold w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[var(--bg-deep)] border-t-transparent rounded-full animate-spin" />
              ) : step < stepLabels.length - 1 ? (
                <><span>Continue</span><ArrowRight size={16} /></>
              ) : (
                <><Plane size={16} /><span>Create Trip</span></>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
