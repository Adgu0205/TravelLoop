import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Activity = Database['public']['Tables']['activities']['Row']

export function useActivities(cityId?: string, category?: string) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!cityId) return
    async function fetch() {
      setLoading(true)
      let q = supabase.from('activities').select('*').eq('city_id', cityId!)
      if (category && category !== 'all') q = q.eq('category', category)
      const { data } = await q.order('cost_estimate')
      setActivities(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [cityId, category])

  return { activities, loading }
}
