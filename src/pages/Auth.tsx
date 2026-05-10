import { useState, Suspense, forwardRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Globe, ArrowRight, Plane } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from '@/lib/schemas'
import { ParticleField } from '@/features/particles/ParticleField'
import toast from 'react-hot-toast'

const FloatingInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
>(function FloatingInput({ label, type = 'text', error, ...props }, ref) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="floating-label-group">
      <input
        {...props}
        ref={ref}
        type={isPassword ? (show ? 'text' : 'password') : type}
        placeholder=" "
      />
      <label>{label}</label>
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent-gold)]"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
      {error && <p className="text-red-400 text-xs mt-1 ml-1">{error}</p>}
    </div>
  )
})

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const { login, signup } = useAuth()

  const [emailSent, setEmailSent] = useState(false)
  const loginForm = useForm<LoginInput>({ resolver: zodResolver(loginSchema), mode: 'onTouched' })
  const signupForm = useForm<SignupInput>({ resolver: zodResolver(signupSchema), mode: 'onTouched' })

  async function handleLogin(data: LoginInput) {
    setLoading(true)
    try { await login(data) }
    catch (e: any) { toast.error(e.message ?? 'Login failed') }
    finally { setLoading(false) }
  }

  async function handleSignup(data: SignupInput) {
    setLoading(true)
    try {
      const sent = await signup(data)
      if (sent) setEmailSent(true)
    }
    catch (e: any) { toast.error(e.message ?? 'Signup failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT — 3D Particle Globe */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-gradient-to-br from-[var(--bg-deep)] to-[var(--bg-mid)] overflow-hidden">
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <ParticleField className="w-full h-full" />
          </Suspense>
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--accent-teal)] to-[var(--accent-sage)] flex items-center justify-center shadow-glow">
            <Globe size={32} className="text-[var(--text-primary)]" />
          </div>
          <h1 className="font-display text-5xl text-[var(--text-primary)] mb-4">
            Traveloop
          </h1>
          <p className="text-[var(--text-muted)] text-lg leading-relaxed max-w-xs">
            Plan extraordinary journeys with AI-powered itineraries and an interactive 3D globe.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {['Tokyo', 'Bali', 'Paris', 'Dubai', 'Santorini'].map((city) => (
              <span key={city} className="px-3 py-1 glass rounded-full text-xs text-[var(--accent-gold)] border border-[var(--glass-border)]">
                {city}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-[var(--text-muted)]">
          22 destinations · 110+ activities
        </div>
      </div>

      {/* RIGHT — Auth Form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8 bg-[var(--bg-deep)]">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-teal)] to-[var(--accent-sage)] flex items-center justify-center">
              <Globe size={16} className="text-[var(--text-primary)]" />
            </div>
            <span className="font-display font-bold text-lg text-[var(--text-primary)]">Traveloop</span>
          </div>

          {/* Toggle */}
          <div className="glass rounded-xl p-1 flex mb-8">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === m
                    ? 'bg-[var(--accent-gold)] text-[var(--bg-deep)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                onSubmit={loginForm.handleSubmit(handleLogin)}
                className="space-y-4"
              >
                <div>
                  <h2 className="font-display text-2xl text-[var(--text-primary)] mb-1">Welcome back</h2>
                  <p className="text-[var(--text-muted)] text-sm">Sign in to continue your journey</p>
                </div>

                <FloatingInput
                  label="Email"
                  type="email"
                  {...loginForm.register('email')}
                  error={loginForm.formState.errors.email?.message}
                />
                <FloatingInput
                  label="Password"
                  type="password"
                  {...loginForm.register('password')}
                  error={loginForm.formState.errors.password?.message}
                />

                <div className="text-right">
                  <button type="button" className="text-xs text-[var(--accent-gold)] hover:underline">
                    Forgot password?
                  </button>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="btn-gold w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden relative"
                >
                  {loading ? (
                    <motion.div
                      initial={{ x: '-120%' }}
                      animate={{ x: '220%' }}
                      transition={{ duration: 0.9, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.1 }}
                      className="flex items-center gap-1"
                    >
                      <Plane size={16} className="-rotate-12" />
                      <span className="text-sm">Taking off…</span>
                    </motion.div>
                  ) : (
                    <><span>Sign In</span><ArrowRight size={16} /></>
                  )}
                </motion.button>

                <div className="relative flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-[var(--glass-border)]" />
                  <span className="text-xs text-[var(--text-muted)]">or</span>
                  <div className="flex-1 h-px bg-[var(--glass-border)]" />
                </div>

                <button
                  type="button"
                  onClick={() => {}}
                  className="w-full py-2.5 rounded-xl border border-[var(--glass-border)] flex items-center justify-center gap-2 text-sm text-[var(--text-primary)] hover:border-[var(--accent-gold)] transition-colors bg-white"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/></svg>
                  Continue with Google
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                onSubmit={signupForm.handleSubmit(handleSignup)}
                className="space-y-4"
              >
                <div>
                  <h2 className="font-display text-2xl text-[var(--text-primary)] mb-1">Start exploring</h2>
                  <p className="text-[var(--text-muted)] text-sm">Create your free account</p>
                </div>

                <FloatingInput
                  label="Full Name"
                  {...signupForm.register('name')}
                  error={signupForm.formState.errors.name?.message}
                />
                <FloatingInput
                  label="Email"
                  type="email"
                  {...signupForm.register('email')}
                  error={signupForm.formState.errors.email?.message}
                />
                <FloatingInput
                  label="Password"
                  type="password"
                  {...signupForm.register('password')}
                  error={signupForm.formState.errors.password?.message}
                />

                {emailSent ? (
                  <div className="glass rounded-xl p-4 text-center space-y-2">
                    <p className="text-[var(--accent-gold)] font-semibold text-sm">Check your email</p>
                    <p className="text-[var(--text-muted)] text-xs">
                      We sent a confirmation link to <span className="text-[var(--text-primary)]">{signupForm.getValues('email')}</span>. Click it to activate your account.
                    </p>
                    <button
                      type="button"
                      onClick={() => setEmailSent(false)}
                      className="text-xs text-[var(--accent-teal)] hover:underline"
                    >
                      Use a different email
                    </button>
                  </div>
                ) : (
                  <>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="btn-gold w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-60 overflow-hidden relative"
                    >
                      {loading ? (
                        <motion.div
                          initial={{ x: '-120%' }}
                          animate={{ x: '220%' }}
                          transition={{ duration: 0.9, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.1 }}
                          className="flex items-center gap-1"
                        >
                          <Plane size={16} className="-rotate-12" />
                          <span className="text-sm">Taking off…</span>
                        </motion.div>
                      ) : (
                        <><span>Create Account</span><ArrowRight size={16} /></>
                      )}
                    </motion.button>
                    <p className="text-xs text-[var(--text-muted)] text-center">
                      By creating an account, you agree to our Terms & Privacy Policy.
                    </p>
                  </>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
