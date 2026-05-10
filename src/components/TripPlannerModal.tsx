import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Sparkles, MapPin, Calendar, Wallet, Heart, Plane } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useTripsStore } from '@/store/tripsStore'
import toast from 'react-hot-toast'

const REGIONS = [
  { value: 'Asia', emoji: '🏯' },
  { value: 'Europe', emoji: '🏰' },
  { value: 'Americas', emoji: '🗽' },
  { value: 'Middle East', emoji: '🕌' },
  { value: 'Africa', emoji: '🦁' },
  { value: 'Oceania', emoji: '🦘' },
]

const INTERESTS = [
  { value: 'culture', label: 'Culture & History', emoji: '🏛️' },
  { value: 'food', label: 'Food & Dining', emoji: '🍜' },
  { value: 'adventure', label: 'Adventure', emoji: '🧗' },
  { value: 'relaxation', label: 'Relaxation', emoji: '🌊' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'nightlife', label: 'Nightlife', emoji: '🎵' },
]

const DURATIONS = [
  { value: 3, label: '3 days', sub: 'Weekend' },
  { value: 7, label: '1 week', sub: 'Short trip' },
  { value: 14, label: '2 weeks', sub: 'Classic' },
  { value: 21, label: '3 weeks', sub: 'Extended' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function TripPlannerModal({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addTrip } = useTripsStore()
  const [step, setStep] = useState(0)
  const [region, setRegion] = useState('')
  const [duration, setDuration] = useState(7)
  const [budget, setBudget] = useState(50000)
  const [interests, setInterests] = useState<string[]>([])
  const [planning, setPlanning] = useState(false)
  const [planStep, setPlanStep] = useState(0)

  const PLAN_STEPS = [
    'Searching destinations…',
    'Selecting top cities…',
    'Picking activities…',
    'Building itinerary…',
    'Distributing budget…',
  ]

  function toggleInterest(v: string) {
    setInterests((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v])
  }

  async function generate() {
    if (!user) return
    setPlanning(true)

    // Animate through plan steps
    for (let i = 0; i < PLAN_STEPS.length; i++) {
      setPlanStep(i)
      await new Promise((r) => setTimeout(r, 600))
    }

    try {
      // Fetch cities in selected region
      const { data: cities } = await supabase
        .from('cities')
        .select('*')
        .ilike('region', `%${region}%`)
        .order('popularity_score', { ascending: false })
        .limit(20)

      if (!cities || cities.length === 0) {
        toast.error('No cities found for this region')
        setPlanning(false)
        return
      }

      // Pick 1–3 cities based on duration
      const cityCount = duration <= 5 ? 1 : duration <= 12 ? 2 : 3
      const pickedCities = cities.slice(0, cityCount)

      // Create trip
      const tripName = `${region} ${duration}-Day Adventure`
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + 7)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + duration - 1)

      const { data: trip, error: tripErr } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          name: tripName,
          description: `Auto-planned ${duration}-day trip across ${pickedCities.map((c) => c.name).join(', ')}`,
          cover_photo_url: pickedCities[0]?.cover_image_url ?? null,
          start_date: startDate.toISOString().slice(0, 10),
          end_date: endDate.toISOString().slice(0, 10),
          total_budget: budget,
          is_public: false,
        })
        .select()
        .single()

      if (tripErr || !trip) { toast.error('Failed to create trip'); setPlanning(false); return }
      addTrip(trip)

      // Create stops
      const daysPerCity = Math.floor(duration / cityCount)
      for (let i = 0; i < pickedCities.length; i++) {
        const city = pickedCities[i]
        const stopStart = new Date(startDate)
        stopStart.setDate(stopStart.getDate() + i * daysPerCity)
        const stopEnd = new Date(stopStart)
        stopEnd.setDate(stopEnd.getDate() + daysPerCity - 1)

        const { data: stop } = await supabase
          .from('stops')
          .insert({
            trip_id: trip.id,
            city_id: city.id,
            position_order: i + 1,
            start_date: stopStart.toISOString().slice(0, 10),
            end_date: stopEnd.toISOString().slice(0, 10),
          })
          .select()
          .single()

        if (!stop) continue

        // Fetch activities for this city matching interests
        let actQuery = supabase
          .from('activities')
          .select('*')
          .eq('city_id', city.id)
          .lte('cost_estimate', Math.round((budget * 0.15) / cityCount))
          .limit(6)

        if (interests.length > 0) {
          actQuery = actQuery.in('category', interests)
        }

        const { data: activities } = await actQuery

        // Fallback: any activities if no interest match
        const finalActivities = activities && activities.length > 0
          ? activities
          : (await supabase.from('activities').select('*').eq('city_id', city.id).limit(4)).data ?? []

        for (const act of finalActivities.slice(0, 4)) {
          await supabase.from('stop_activities').insert({
            stop_id: stop.id,
            activity_id: act.id,
            cost_override: null,
            notes: null,
          })
        }
      }

      // Create budget with auto-distribution
      await supabase.from('budgets').insert({
        trip_id: trip.id,
        transport: Math.round(budget * 0.25),
        stay: Math.round(budget * 0.35),
        meals: Math.round(budget * 0.20),
        activities: Math.round(budget * 0.15),
        misc: Math.round(budget * 0.05),
        total_limit: budget,
      })

      // Default checklist items
      const checklistItems = [
        { category: 'Documents', item_name: 'Passport' },
        { category: 'Documents', item_name: 'Travel insurance' },
        { category: 'Clothing', item_name: 'Comfortable walking shoes' },
        { category: 'Tech', item_name: 'Phone charger & adapter' },
        { category: 'Health', item_name: 'Basic first aid kit' },
      ]
      await supabase.from('checklist_items').insert(
        checklistItems.map((item) => ({ ...item, trip_id: trip.id, is_packed: false }))
      )

      toast.success('Trip planned! 🎉')
      onClose()
      navigate(`/trips/${trip.id}`)
    } catch {
      toast.error('Planning failed. Try again.')
      setPlanning(false)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative w-full max-w-lg glass-strong rounded-2xl overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 24 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--glass-border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-gold)]/20 flex items-center justify-center">
                <Sparkles size={18} className="text-[var(--accent-gold)]" />
              </div>
              <div>
                <h2 className="font-display text-lg text-[var(--text-primary)]">Smart Planner</h2>
                <p className="text-xs text-[var(--text-muted)]">Auto-generate your perfect trip</p>
              </div>
            </div>
            <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-6">
            {planning ? (
              <div className="py-8 flex flex-col items-center gap-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 rounded-full border-4 border-[var(--accent-gold)]/20 border-t-[var(--accent-gold)] flex items-center justify-center"
                >
                  <Plane size={24} className="text-[var(--accent-gold)]" />
                </motion.div>
                <div className="text-center space-y-2">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={planStep}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="font-display text-lg text-[var(--text-primary)]"
                    >
                      {PLAN_STEPS[planStep]}
                    </motion.p>
                  </AnimatePresence>
                  <p className="text-xs text-[var(--text-muted)]">Building your {duration}-day {region} adventure</p>
                </div>
                <div className="flex gap-1.5">
                  {PLAN_STEPS.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= planStep ? 'w-8 bg-[var(--accent-gold)]' : 'w-3 bg-[var(--bg-surface)]'}`} />
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin size={16} className="text-[var(--accent-gold)]" />
                      <h3 className="text-sm font-medium text-[var(--text-primary)]">Where do you want to go?</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {REGIONS.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => setRegion(r.value)}
                          className={`p-3 rounded-xl border text-center transition-all ${region === r.value ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10' : 'border-[var(--glass-border)] hover:border-[var(--accent-teal)]'}`}
                        >
                          <div className="text-2xl mb-1">{r.emoji}</div>
                          <p className="text-xs text-[var(--text-primary)]">{r.value}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar size={16} className="text-[var(--accent-gold)]" />
                      <h3 className="text-sm font-medium text-[var(--text-primary)]">How long is your trip?</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {DURATIONS.map((d) => (
                        <button
                          key={d.value}
                          onClick={() => setDuration(d.value)}
                          className={`p-4 rounded-xl border text-left transition-all ${duration === d.value ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10' : 'border-[var(--glass-border)] hover:border-[var(--accent-teal)]'}`}
                        >
                          <p className="font-display text-lg text-[var(--text-primary)]">{d.label}</p>
                          <p className="text-xs text-[var(--text-muted)]">{d.sub}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <Wallet size={16} className="text-[var(--accent-gold)]" />
                      <h3 className="text-sm font-medium text-[var(--text-primary)]">What's your total budget? (₹)</h3>
                    </div>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-4 text-[var(--text-primary)] font-display text-3xl outline-none focus:border-[var(--accent-gold)] transition-colors text-center"
                    />
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[25000, 75000, 150000].map((v) => (
                        <button key={v} onClick={() => setBudget(v)} className="py-2 rounded-lg border border-[var(--glass-border)] text-xs text-[var(--text-muted)] hover:border-[var(--accent-teal)] hover:text-[var(--text-primary)] transition-colors">
                          ₹{(v / 1000).toFixed(0)}k
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-3 text-center">
                      Will be auto-distributed: Transport 25% · Stay 35% · Food 20% · Activities 15% · Misc 5%
                    </p>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <Heart size={16} className="text-[var(--accent-gold)]" />
                      <h3 className="text-sm font-medium text-[var(--text-primary)]">What are your interests?</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {INTERESTS.map((int) => (
                        <button
                          key={int.value}
                          onClick={() => toggleInterest(int.value)}
                          className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${interests.includes(int.value) ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10' : 'border-[var(--glass-border)] hover:border-[var(--accent-teal)]'}`}
                        >
                          <span className="text-lg">{int.emoji}</span>
                          <span className="text-xs text-[var(--text-primary)]">{int.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-3 text-center">Select any or leave all for a mixed trip</p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {!planning && (
            <div className="px-6 pb-6 flex gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="w-10 h-10 glass rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <button
                onClick={() => {
                  if (step === 0 && !region) { toast.error('Pick a region'); return }
                  if (step < 3) setStep((s) => s + 1)
                  else generate()
                }}
                className="btn-gold flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
              >
                {step < 3 ? (
                  <><span>Continue</span><ArrowRight size={16} /></>
                ) : (
                  <><Sparkles size={16} /><span>Plan My Trip</span></>
                )}
              </button>
            </div>
          )}

          {/* Step dots */}
          {!planning && (
            <div className="flex justify-center gap-1.5 pb-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-200 ${i === step ? 'w-5 bg-[var(--accent-gold)]' : 'w-1.5 bg-[var(--glass-border)]'}`} />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
