import { create } from 'zustand'
import { User } from '@/types'

interface AuthState {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => {
    localStorage.setItem('token', user.token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null })
  },
  hydrate: () => {
    const stored = localStorage.getItem('user')
    if (stored) set({ user: JSON.parse(stored) })
  },
}))
