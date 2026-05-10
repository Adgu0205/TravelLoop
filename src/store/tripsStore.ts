import { create } from 'zustand'
import type { Database } from '@/lib/supabase'

type Trip = Database['public']['Tables']['trips']['Row']
type Stop = Database['public']['Tables']['stops']['Row']
type City = Database['public']['Tables']['cities']['Row']
type Activity = Database['public']['Tables']['activities']['Row']

interface TripsState {
  trips: Trip[]
  currentTrip: Trip | null
  stops: Stop[]
  cities: City[]
  activities: Activity[]
  setTrips: (trips: Trip[]) => void
  setCurrentTrip: (trip: Trip | null) => void
  setStops: (stops: Stop[]) => void
  setCities: (cities: City[]) => void
  setActivities: (activities: Activity[]) => void
  addTrip: (trip: Trip) => void
  updateTrip: (id: string, data: Partial<Trip>) => void
  removeTrip: (id: string) => void
}

export const useTripsStore = create<TripsState>((set) => ({
  trips: [],
  currentTrip: null,
  stops: [],
  cities: [],
  activities: [],
  setTrips: (trips) => set({ trips }),
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  setStops: (stops) => set({ stops }),
  setCities: (cities) => set({ cities }),
  setActivities: (activities) => set({ activities }),
  addTrip: (trip) => set((s) => ({ trips: [trip, ...s.trips] })),
  updateTrip: (id, data) =>
    set((s) => ({
      trips: s.trips.map((t) => (t.id === id ? { ...t, ...data } : t)),
      currentTrip: s.currentTrip?.id === id ? { ...s.currentTrip, ...data } : s.currentTrip,
    })),
  removeTrip: (id) => set((s) => ({ trips: s.trips.filter((t) => t.id !== id) })),
}))
