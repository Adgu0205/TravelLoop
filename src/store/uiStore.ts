import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  activeModal: string | null
  currency: 'INR' | 'USD' | 'EUR'
  theme: 'dark' | 'light'
  setSidebarOpen: (open: boolean) => void
  openModal: (id: string) => void
  closeModal: () => void
  setCurrency: (c: 'INR' | 'USD' | 'EUR') => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  activeModal: null,
  currency: 'INR',
  theme: 'dark',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  setCurrency: (c) => set({ currency: c }),
}))
