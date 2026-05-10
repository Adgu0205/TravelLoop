import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTripsStore } from '@/store/tripsStore'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import type { z } from 'zod'
import { tripSchema } from '@/lib/schemas'
type TripInput = z.infer<typeof tripSchema>

export function useTrips() {
  const { user } = useAuthStore()
  const { trips, setTrips, addTrip, updateTrip, removeTrip } = useTripsStore()

  const fetchTrips = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) { toast.error('Failed to load trips'); return }
    setTrips(data ?? [])
  }, [user, setTrips])

  useEffect(() => { fetchTrips() }, [fetchTrips])

  async function createTrip(input: TripInput) {
    if (!user) return null
    const { data, error } = await supabase
      .from('trips')
      .insert({ ...input, user_id: user.id, total_budget: input.total_budget ?? 0 })
      .select()
      .single()
    if (error) { toast.error('Failed to create trip'); return null }
    addTrip(data)
    const budget = input.total_budget ?? 0
    await supabase.from('budgets').insert({
      trip_id: data.id,
      transport: budget > 0 ? Math.round(budget * 0.25) : 0,
      stay:      budget > 0 ? Math.round(budget * 0.35) : 0,
      meals:     budget > 0 ? Math.round(budget * 0.20) : 0,
      activities:budget > 0 ? Math.round(budget * 0.15) : 0,
      misc:      budget > 0 ? Math.round(budget * 0.05) : 0,
      total_limit: budget,
    })
    toast.success('Trip created!')
    return data
  }

  async function deleteTrip(id: string) {
    const { error } = await supabase.from('trips').delete().eq('id', id)
    if (error) { toast.error('Failed to delete trip'); return }
    removeTrip(id)
    toast.success('Trip deleted')
  }

  async function togglePublic(id: string, isPublic: boolean) {
    const { error } = await supabase.from('trips').update({ is_public: isPublic }).eq('id', id)
    if (!error) updateTrip(id, { is_public: isPublic })
  }

  return { trips, fetchTrips, createTrip, deleteTrip, togglePublic }
}
