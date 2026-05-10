import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa']

interface DatePickerProps {
  value?: string        // YYYY-MM-DD
  onChange: (v: string) => void
  label?: string
  min?: string
  max?: string
  className?: string
}

export function DatePicker({ value, onChange, label = 'Select date', min, max, className = '' }: DatePickerProps) {
  const today = new Date()
  const parsed = value ? new Date(value + 'T12:00:00') : null
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(parsed?.getFullYear() ?? today.getFullYear())
  const [month, setMonth] = useState(parsed?.getMonth() ?? today.getMonth())
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  )

  function toISO(d: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  function disabled(d: number) {
    const iso = toISO(d)
    return (!!min && iso < min) || (!!max && iso > max)
  }

  function isSelected(d: number) {
    return !!parsed && parsed.getFullYear() === year && parsed.getMonth() === month && parsed.getDate() === d
  }

  function isToday(d: number) {
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === d
  }

  const displayText = parsed
    ? parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-white border-[1.5px] border-[rgba(196,134,42,0.22)] hover:border-[var(--accent-gold)] transition-colors text-left"
        style={{ boxShadow: '0 1px 4px rgba(28,43,54,0.05)' }}
      >
        <Calendar size={14} className="text-[var(--text-muted)] shrink-0" />
        <span className={`text-sm ${displayText ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
          {displayText || label}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 glass-strong rounded-2xl p-4 shadow-xl"
            style={{ width: 280 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={prevMonth}
                className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:border-[var(--accent-gold)] transition-colors"
              >
                <ChevronLeft size={14} className="text-[var(--text-muted)]" />
              </button>
              <span className="font-display text-sm font-semibold text-[var(--text-primary)]">
                {MONTHS[month]} {year}
              </span>
              <button type="button" onClick={nextMonth}
                className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:border-[var(--accent-gold)] transition-colors"
              >
                <ChevronRight size={14} className="text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS_SHORT.map((d) => (
                <div key={d} className="text-center text-[10px] text-[var(--text-muted)] font-medium py-1">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((day, i) => (
                <div key={i} className="flex items-center justify-center h-8">
                  {day && (
                    <button
                      type="button"
                      disabled={disabled(day)}
                      onClick={() => { onChange(toISO(day)); setOpen(false) }}
                      className={`w-8 h-8 rounded-full text-xs flex items-center justify-center transition-all font-medium ${
                        isSelected(day)
                          ? 'bg-[var(--accent-gold)] text-white shadow-sm'
                          : disabled(day)
                          ? 'text-[var(--text-muted)] opacity-30 cursor-not-allowed'
                          : isToday(day)
                          ? 'border border-[var(--accent-teal)] text-[var(--accent-teal)] hover:bg-[var(--accent-teal)]/10'
                          : 'text-[var(--text-primary)] hover:bg-[var(--accent-gold)]/12 cursor-pointer'
                      }`}
                    >
                      {day}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-[var(--glass-border)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()) }}
                className="text-xs text-[var(--accent-teal)] hover:underline"
              >
                Today
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => { onChange(''); setOpen(false) }}
                  className="text-xs text-[var(--text-muted)] hover:text-red-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
