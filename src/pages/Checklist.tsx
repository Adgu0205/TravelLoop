import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Check, Trash2, RotateCcw } from 'lucide-react'
import { ProgressBar } from '@/components/ProgressBar'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

type Item = { id: string; category: string; item_name: string; is_packed: boolean; note: string | null }

const TABS = [
  { key: 'clothing', label: 'Clothing', emoji: '👔' },
  { key: 'documents', label: 'Documents', emoji: '📄' },
  { key: 'electronics', label: 'Electronics', emoji: '💻' },
  { key: 'toiletries', label: 'Toiletries', emoji: '🧴' },
  { key: 'misc', label: 'Other', emoji: '🎒' },
]

export default function Checklist() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [items, setItems] = useState<Item[]>([])
  const [activeTab, setActiveTab] = useState('clothing')
  const [newItem, setNewItem] = useState('')
  const [trip, setTrip] = useState<any>(null)
  const [celebrated, setCelebrated] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('trips').select('name').eq('id', id).single().then(({ data }) => setTrip(data))
    supabase.from('checklist_items').select('*').eq('trip_id', id).then(({ data }) => setItems(data ?? []))
  }, [id])

  const tabItems = items.filter((i) => i.category === activeTab)
  const packed = items.filter((i) => i.is_packed).length
  const total = items.length
  const pct = total > 0 ? Math.round((packed / total) * 100) : 0

  useEffect(() => {
    if (pct === 100 && total > 0 && !celebrated) {
      setCelebrated(true)
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#E0DDAA', '#1D546D', '#5F9598'] })
      toast.success('All packed! Ready to go! 🎉')
    }
    if (pct < 100) setCelebrated(false)
  }, [pct, total])

  async function addItem() {
    if (!newItem.trim() || !id) return
    const { data, error } = await supabase
      .from('checklist_items')
      .insert({ trip_id: id, category: activeTab, item_name: newItem.trim(), is_packed: false })
      .select().single()
    if (error) { toast.error('Failed to add item'); return }
    setItems((prev) => [...prev, data as Item])
    setNewItem('')
  }

  async function toggleItem(item: Item) {
    const { error } = await supabase.from('checklist_items').update({ is_packed: !item.is_packed }).eq('id', item.id)
    if (!error) setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_packed: !i.is_packed } : i))
  }

  async function deleteItem(itemId: string) {
    await supabase.from('checklist_items').delete().eq('id', itemId)
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  async function resetAll() {
    if (!id) return
    await supabase.from('checklist_items').update({ is_packed: false }).eq('trip_id', id)
    setItems((prev) => prev.map((i) => ({ ...i, is_packed: false })))
    toast.success('All items reset')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pt-16">
      <div className="glass-strong border-b border-[var(--glass-border)] px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(`/trips/${id}`)} className="w-8 h-8 glass rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl text-[var(--text-primary)]">{trip?.name} — Packing</h1>
          </div>
          <button onClick={resetAll} className="btn-teal px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress */}
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-muted)]">{packed} of {total} items packed</span>
            <span className={`text-lg font-display ${pct === 100 ? 'text-[var(--accent-gold)]' : 'text-[var(--text-primary)]'}`}>{pct}%</span>
          </div>
          <ProgressBar value={pct} max={100} color={pct === 100 ? 'gold' : 'teal'} />
        </div>

        {/* Quick add */}
        <div className="flex gap-2 mb-6">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add item..."
            className="flex-1 bg-[var(--bg-mid)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-gold)] transition-colors"
          />
          <button onClick={addItem} className="btn-gold px-4 py-3 rounded-xl">
            <Plus size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto glass rounded-xl p-1 mb-5">
          {TABS.map((tab) => {
            const count = items.filter((i) => i.category === tab.key).length
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-[var(--accent-gold)] text-[var(--bg-deep)] font-medium' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                {count > 0 && <span className="bg-[var(--bg-surface)] text-[var(--text-muted)] rounded-full px-1.5 text-xs">{count}</span>}
              </button>
            )
          })}
        </div>

        {/* Items */}
        <div className="space-y-2">
          <AnimatePresence>
            {tabItems.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                No items in {TABS.find((t) => t.key === activeTab)?.label}. Add some above!
              </div>
            ) : (
              tabItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${item.is_packed ? 'glass border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/5' : 'glass border-[var(--glass-border)]'}`}
                >
                  <button
                    onClick={() => toggleItem(item)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${item.is_packed ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)]' : 'border-[var(--accent-teal)] hover:border-[var(--accent-gold)]'}`}
                  >
                    {item.is_packed && <Check size={12} className="text-[var(--bg-deep)]" />}
                  </button>
                  <span className={`flex-1 text-sm transition-all ${item.is_packed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                    {item.item_name}
                  </span>
                  <button onClick={() => deleteItem(item.id)} className="text-[var(--text-muted)] hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
