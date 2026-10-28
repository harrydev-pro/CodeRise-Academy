import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { apiClient } from '../services/api/client';

const defaultUser = {
  id: 'guest',
  fullName: 'Guest User',
  email: 'guest@coderiseacademy.com',
  role: 'student',
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      authError: null,

      setAuth: (user, token = null) =>
        set({
          user,
          token,
          isAuthenticated: Boolean(user),
          authError: null,
        }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          authError: null,
        }),

      login: async ({ email, password }) => {
        set({ loading: true, authError: null });

        try {
          const result = await apiClient('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });

          if (!result.ok) {
            const message = result.error || 'Invalid email or password.';
            set({ loading: false, authError: message, isAuthenticated: false });
            return { success: false, message };
          }

          const payload = result.data?.data || result.data || {};
          const user = payload.user || { ...defaultUser, email, id: `user-${Date.now()}` };
          const token = payload.token || 'demo-token';

          set({ user, token, isAuthenticated: true, loading: false, authError: null });
          return { success: true, user };
        } catch (error) {
          const message = error?.message || 'Unable to sign in.';
          set({ loading: false, authError: message, isAuthenticated: false });
          return { success: false, message };
        }
      },

      register: async ({ fullName, email, phone, password }) => {
        set({ loading: true, authError: null });

        try {
          const result = await apiClient('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, phone, password }),
          });

          if (!result.ok) {
            const message = result.error || 'Unable to create your account.';
            set({ loading: false, authError: message });
            return { success: false, message };
          }

          const payload = result.data?.data || result.data || {};
          const user = payload.user || {
            id: `user-${Date.now()}`,
            fullName,
            email,
            phone,
            role: 'student',
          };

          set({ user, isAuthenticated: true, loading: false, authError: null });
          return { success: true, user };
        } catch (error) {
          const message = error?.message || 'Registration failed.';
          set({ loading: false, authError: message });
          return { success: false, message };
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await apiClient('/auth/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${get().token}`,
            },
          });
        } catch {
          // Graceful fallback when backend is unavailable.
        }

        set({ user: null, token: null, isAuthenticated: false, loading: false, authError: null });
        return true;
      },
    }),
    {
      name: 'coderise-auth-store',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
