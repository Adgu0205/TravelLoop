import { useUIStore } from '@/store/uiStore'

const RATES: Record<string, number> = { INR: 1, USD: 0.012, EUR: 0.011 }
const SYMBOLS: Record<string, string> = { INR: '₹', USD: '$', EUR: '€' }

export function CurrencyToggle() {
  const { currency, setCurrency } = useUIStore()
  const options: ('INR' | 'USD' | 'EUR')[] = ['INR', 'USD', 'EUR']

  return (
    <div className="flex gap-1 p-1 bg-[var(--bg-surface)] rounded-lg">
      {options.map((c) => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            currency === c
              ? 'bg-[var(--accent-gold)] text-[var(--bg-deep)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          {SYMBOLS[c]} {c}
        </button>
      ))}
    </div>
  )
}

export function useFormatCurrency() {
  const { currency } = useUIStore()
  return (amount: number) => {
    const converted = amount * RATES[currency]
    return `${SYMBOLS[currency]}${converted.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }
}
