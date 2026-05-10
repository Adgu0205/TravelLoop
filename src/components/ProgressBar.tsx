import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  color?: 'gold' | 'teal' | 'sage'
  showLabel?: boolean
}

const colorMap = {
  gold: 'var(--accent-gold)',
  teal: 'var(--accent-teal)',
  sage: 'var(--accent-sage)',
}

export function ProgressBar({ value, max = 100, className = '', color = 'gold', showLabel = false }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className={`relative h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: colorMap[color] }}
      />
      {showLabel && (
        <span className="absolute right-0 -top-5 text-xs text-[var(--text-muted)]">{pct}%</span>
      )}
    </div>
  )
}
