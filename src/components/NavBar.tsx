import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Globe, Search, User, LogOut, Settings, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useAuthStore } from '@/store/authStore'
import { ADMIN_EMAIL } from '@/App'
import { motion, AnimatePresence } from 'framer-motion'

export function NavBar() {
  const { user, logout } = useAuth()
  const { user: storeUser } = useAuthStore()
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const isAdmin = storeUser?.email === ADMIN_EMAIL

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/cities?q=${encodeURIComponent(searchQuery)}`)
  }

  const initials = user?.user_metadata?.name
    ? user.user_metadata.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass-strong border-b border-[var(--glass-border)]">
      <div className="h-full flex items-center gap-3 pl-5 pr-4">
        {/* Logo block — same width as sidebar */}
        <Link to="/" className="flex items-center gap-2 w-8 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-sage))' }}>
            <Globe size={15} className="text-white" />
          </div>
        </Link>

        <span className="font-display font-bold text-base text-[var(--text-primary)] tracking-tight hidden sm:block">
          Traveloop
        </span>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden md:block ml-4">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search cities…"
              className="w-full rounded-lg pl-8 pr-4 py-1.5 text-sm outline-none transition-colors"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent-gold)')}
              onBlur={e => (e.target.style.borderColor = 'var(--glass-border)')}
            />
          </div>
        </form>

        <div className="flex-1" />

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={dark ? 'Light mode' : 'Dark mode'}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-transparent hover:ring-[var(--accent-gold)] transition-all"
            style={{ background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-sage))' }}
          >
            {initials ?? <User size={14} />}
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 6 }}
                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                onMouseLeave={() => setMenuOpen(false)}
                className="absolute right-0 top-11 w-52 rounded-xl overflow-hidden shadow-glass z-50"
                style={{ background: 'var(--bg-mid)', border: '1px solid var(--glass-border)' }}
              >
                <div className="px-4 py-3 border-b border-[var(--glass-border)]">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                    {user?.user_metadata?.name ?? 'Traveler'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{user?.email}</p>
                  {isAdmin && (
                    <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-md font-semibold"
                      style={{ background: 'rgba(196,134,42,0.15)', color: 'var(--accent-gold)' }}>
                      Admin
                    </span>
                  )}
                </div>
                <div className="p-1.5">
                  <Link to="/profile" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors">
                    <Settings size={13} /> Profile & Settings
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); logout() }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={13} /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  )
}
