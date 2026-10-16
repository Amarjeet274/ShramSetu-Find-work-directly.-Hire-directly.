import { create } from 'zustand';
import api from '../services/api';

export const useProfileStore = create((set, get) => ({
  /* ── Worker profile (existing) ── */
  profile: null,
  lastFetched: null,

  /* ── Employer profile (new) ── */
  employerProfile: null,
  lastFetchedEmployer: null,

  loading: false,

  /* ─────────────── WORKER ─────────────── */
  fetchProfile: async (force = false) => {
    const { lastFetched, loading } = get();
    if (loading) return;
    if (!force && lastFetched && Date.now() - lastFetched < 30000) return;

    set({ loading: true });
    try {
      const { data } = await api.get('/workers/me');
      set({ profile: data.profile, lastFetched: Date.now(), loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setProfile: (profile) => set({ profile, lastFetched: Date.now() }),

  /* ─────────────── EMPLOYER ─────────────── */
  fetchEmployerProfile: async (force = false) => {
    const { lastFetchedEmployer, loading } = get();
    if (loading) return;
    if (!force && lastFetchedEmployer && Date.now() - lastFetchedEmployer < 30000) return;

    set({ loading: true });
    try {
      const { data } = await api.get('/employers/me');
      set({
        employerProfile: data.profile,
        lastFetchedEmployer: Date.now(),
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  setEmployerProfile: (employerProfile) =>
    set({ employerProfile, lastFetchedEmployer: Date.now() }),

  /* ─────────────── SHARED ─────────────── */
  clear: () => set({
    profile: null,
    employerProfile: null,
    lastFetched: null,
    lastFetchedEmployer: null,
    loading: false,
  }),
}));