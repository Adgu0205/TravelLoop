import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Globe, Search, User, LogOut, Map, Luggage, LayoutDashboard, Settings, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { motion, AnimatePresence } from 'framer-motion'

export function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/trips', label: 'My Trips', icon: Luggage },
    { to: '/cities', label: 'Explore', icon: Map },
  ]

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/cities?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-[var(--glass-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-teal)] to-[var(--accent-sage)] flex items-center justify-center">
            <Globe size={16} className="text-[var(--text-primary)]" />
          </div>
          <span className="font-display font-bold text-lg text-[var(--text-primary)] hidden sm:block">
            Traveloop
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === to
                  ? 'bg-[var(--accent-teal)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(29,84,109,0.3)]'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xs hidden sm:block">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cities..."
              className="w-full bg-[rgba(10,37,53,0.5)] border border-[var(--glass-border)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-gold)] transition-colors"
            />
          </div>
        </form>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-xl glass flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-teal)] to-[var(--accent-sage)] flex items-center justify-center text-sm font-semibold hover:ring-2 hover:ring-[var(--accent-gold)] transition-all"
          >
            {user?.user_metadata?.name?.[0]?.toUpperCase() ?? <User size={16} />}
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-48 glass-strong rounded-xl overflow-hidden shadow-glass z-50"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <div className="p-3 border-b border-[var(--glass-border)]">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {user?.user_metadata?.name ?? 'Traveler'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(29,84,109,0.3)] transition-colors"
                  >
                    <Settings size={14} /> Profile & Settings
                  </Link>
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(29,84,109,0.3)] transition-colors"
                  >
                    <LayoutDashboard size={14} /> Admin
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); logout() }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={14} /> Sign Out
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
