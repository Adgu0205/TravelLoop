import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import type { LoginInput, SignupInput } from '@/lib/schemas'

export function useAuthListener() {
  const { setUser, setSession, setLoading } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setSession, setLoading])
}

export function useAuth() {
  const { user, session, loading } = useAuthStore()
  const navigate = useNavigate()

  async function login({ email, password }: LoginInput) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    navigate('/')
  }

  async function signup({ email, password, name }: SignupInput): Promise<boolean> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
    if (data.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
        email,
        name,
        language: 'en',
        currency: 'INR',
      })
    }
    // If session exists, email confirmation is disabled — go straight to dashboard
    if (data.session) {
      navigate('/')
      return false
    }
    // Email confirmation required
    return true
  }

  async function logout() {
    await supabase.auth.signOut()
    toast.success('Logged out')
    navigate('/auth')
  }

  return { user, session, loading, login, signup, logout }
}
