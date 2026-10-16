import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,          // ← in-memory only; not persisted
      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setAuth: ({ user, accessToken }) => set({ user, accessToken }),
      logoutLocal: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'shramsetu-auth',
      // Persist user only — access token stays in memory for the session
      partialize: (state) => ({ user: state.user }),
    }
  )
);