import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Business } from '../types';

interface AuthState {
  business: Business | null;
  login: (business: Business) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      business: null,
      login: (business) => set({ business }),
      logout: () => set({ business: null }),
    }),
    { name: 'tillr-auth' }
  )
);
