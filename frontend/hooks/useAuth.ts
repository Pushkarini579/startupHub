import { create } from 'zustand';
import { User } from '../types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  login: (credentials: any) => Promise<User>;
  registerFounder: (formData: FormData) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
  setTheme: (theme: 'light' | 'dark') => void;
  updateUserProfile: (formData: FormData) => Promise<User>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('startuphub_token') : null,
  loading: false,
  error: null,
  theme: 'dark', // Dark mode by default for premium aesthetics

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post<{ token: string; user: User }>('/auth/login', credentials);
      localStorage.setItem('startuphub_token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      return data.user;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  registerFounder: async (formData) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post<{ token: string; user: User }>('/auth/register', formData, true);
      localStorage.setItem('startuphub_token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      return data.user;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('startuphub_token');
    set({ user: null, token: null, error: null });
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) return null;

    set({ loading: true });
    try {
      const data = await api.get<{ user: User }>('/auth/me');
      set({ user: data.user, loading: false });
      return data.user;
    } catch (err) {
      // Token expired or invalid
      localStorage.removeItem('startuphub_token');
      set({ user: null, token: null, loading: false });
      return null;
    }
  },

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('startuphub_theme', theme);
    }
    set({ theme });
  },

  updateUserProfile: async (formData) => {
    set({ loading: true, error: null });
    try {
      const data = await api.put<{ user: User }>('/auth/profile', formData, true);
      set({ user: data.user, loading: false });
      return data.user;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
export default useAuth;
