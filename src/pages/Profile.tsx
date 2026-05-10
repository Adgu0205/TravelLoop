import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Globe, Shield, AlertTriangle, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Modal } from '@/components/Modal'
import { CurrencyToggle } from '@/components/CurrencyToggle'
import toast from 'react-hot-toast'

const TABS = [
  { key: 'account', label: 'Account', icon: User },
  { key: 'preferences', label: 'Preferences', icon: Globe },
  { key: 'privacy', label: 'Privacy', icon: Shield },
]

export default function Profile() {
  const { user, logout } = useAuth()
  const { } = useAuthStore()
  const { dark, toggle: toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('account')
  const [name, setName] = useState(user?.user_metadata?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  async function saveName() {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ data: { name } })
    if (!error) await supabase.from('users').update({ name }).eq('id', user.id)
    setSaving(false)
    toast.success('Profile updated')
  }

  async function deleteAccount() {
    if (deleteConfirm !== 'DELETE') return toast.error('Type DELETE to confirm')
    toast.error('Account deletion requires a backend function. Contact support.')
    setDeleteOpen(false)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile card */}
        <div className="glass rounded-2xl p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-teal)] to-[var(--accent-sage)] flex items-center justify-center text-2xl font-display font-bold text-[var(--text-primary)]">
            {name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h1 className="font-display text-xl text-[var(--text-primary)]">{name || 'Traveler'}</h1>
            <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 glass rounded-xl p-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${activeTab === key ? 'bg-[var(--accent-gold)] text-[var(--bg-deep)] font-medium' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'account' && (
          <div className="glass rounded-2xl p-6 space-y-5">
            <h2 className="font-display text-lg text-[var(--text-primary)]">Account Details</h2>
            <div>
              <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Display Name</label>
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent-gold)]"
                />
                <button onClick={saveName} disabled={saving} className="btn-gold px-5 py-3 rounded-xl text-sm font-medium">
                  {saving ? '...' : 'Save'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Email</label>
              <input value={user?.email ?? ''} disabled className="w-full bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-muted)] cursor-not-allowed opacity-60" />
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="glass rounded-2xl p-6 space-y-5">
            <h2 className="font-display text-lg text-[var(--text-primary)]">Preferences</h2>
            <div>
              <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Currency</label>
              <CurrencyToggle />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Theme</label>
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-3 w-full p-4 rounded-xl border transition-all ${dark ? 'border-[var(--accent-gold)] bg-[var(--bg-surface)]' : 'border-[var(--glass-border)] hover:border-[var(--accent-gold)]'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-[var(--accent-gold)]/20' : 'bg-[var(--accent-teal)]/15'}`}>
                  {dark ? <Moon size={16} className="text-[var(--accent-gold)]" /> : <Sun size={16} className="text-[var(--accent-teal)]" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{dark ? 'Dark Mode' : 'Light Mode'}</p>
                  <p className="text-xs text-[var(--text-muted)]">{dark ? 'Deep navy, easy on eyes' : 'Warm cream, bright & clear'}</p>
                </div>
                <div className={`ml-auto w-10 h-6 rounded-full transition-colors ${dark ? 'bg-[var(--accent-gold)]' : 'bg-gray-200'} relative`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${dark ? 'left-5' : 'left-1'}`} />
                </div>
              </button>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Language</label>
              <select className="bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent-gold)] w-full">
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="glass rounded-2xl p-6 space-y-5">
            <h2 className="font-display text-lg text-[var(--text-primary)]">Privacy & Security</h2>
            <div className="p-4 bg-[var(--bg-surface)] rounded-xl">
              <p className="text-sm text-[var(--text-muted)]">Your data is protected with Row Level Security. Only you can access your trips and notes.</p>
            </div>
            <div className="border-t border-[var(--glass-border)] pt-5">
              <h3 className="text-sm font-medium text-red-400 flex items-center gap-2 mb-3">
                <AlertTriangle size={14} /> Danger Zone
              </h3>
              <button onClick={() => setDeleteOpen(true)} className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        )}

        <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Account" size="sm">
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-xl border border-red-500/30">
              <AlertTriangle size={20} className="text-red-400" />
              <p className="text-sm text-red-400">This will permanently delete your account and all data.</p>
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-2 block">Type DELETE to confirm</label>
              <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE" className="w-full bg-[var(--bg-surface)] border border-red-500/30 rounded-xl px-4 py-3 text-[var(--text-primary)] outline-none" />
            </div>
            <button onClick={deleteAccount} className="w-full py-3 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
              Delete Account Forever
            </button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
