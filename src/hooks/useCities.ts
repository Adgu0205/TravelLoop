import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type City = Database['public']['Tables']['cities']['Row']

export function useCities(query = '', region = '') {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      let q = supabase.from('cities').select('*').order('popularity_score', { ascending: false })
      if (query) q = q.ilike('name', `%${query}%`)
      if (region) q = q.eq('region', region)
      const { data } = await q.limit(50)
      setCities(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [query, region])

  return { cities, loading }
}
