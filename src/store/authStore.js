import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { apiClient } from '../services/api/client';

function getPayloadData(data) {
  return data?.data || data || {};
}

function getUser(data) {
  const payload = getPayloadData(data);
  const user = payload.user || payload;

  if (!user || typeof user !== 'object' || Array.isArray(user)) {
    return user;
  }

  return {
    ...user,
    fullName: user.fullName || user.name || user.full_name,
  };
}

function getErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

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
          isAuthenticated: Boolean(user && token),
          authError: null,
        }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          authError: null,
        }),

      initialize: async () => {
        const { token, loading } = get();

        if (loading) return;
        if (!token) {
          set({ user: null, isAuthenticated: false, authError: null });
          return;
        }

        set({ loading: true, authError: null });
        try {
          const result = await apiClient('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!result.ok) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false,
              authError: result.error,
            });
            return;
          }

          const user = getUser(result.data);
          if (!user || typeof user !== 'object' || Array.isArray(user)) {
            throw new Error('The current-user endpoint returned an invalid user.');
          }

          set({ user, isAuthenticated: true, loading: false, authError: null });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            authError: getErrorMessage(error, 'Unable to verify your session.'),
          });
        }
      },

      login: async ({ email, password }) => {
        set({ loading: true, authError: null });

        try {
          const result = await apiClient('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });

          if (!result.ok) {
            const message = result.error || 'Invalid email or password.';
            set({
              user: null,
              token: null,
              loading: false,
              authError: message,
              isAuthenticated: false,
            });
            return { success: false, message };
          }

          const payload = getPayloadData(result.data);
          const token = payload.token || payload.accessToken || payload.access_token;
          if (!token) {
            throw new Error('The login response did not include an authentication token.');
          }

          const currentUserResult = await apiClient('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!currentUserResult.ok) {
            throw new Error(currentUserResult.error || 'Unable to retrieve your account.');
          }

          const user = getUser(currentUserResult.data);
          if (!user || typeof user !== 'object' || Array.isArray(user)) {
            throw new Error('The current-user endpoint returned an invalid user.');
          }

          set({ user, token, isAuthenticated: true, loading: false, authError: null });
          return { success: true, user };
        } catch (error) {
          const message = getErrorMessage(error, 'Unable to sign in.');
          set({
            user: null,
            token: null,
            loading: false,
            authError: message,
            isAuthenticated: false,
          });
          return { success: false, message };
        }
      },

      register: async ({ fullName, email, phone, password }) => {
        set({ loading: true, authError: null });

        try {
          const result = await apiClient('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
              name: fullName,
              email,
              phone_number: phone,
              password,
            }),
          });

          if (!result.ok) {
            const message = result.error || 'Unable to create your account.';
            set({ loading: false, authError: message });
            return { success: false, message };
          }

          const payload = getPayloadData(result.data);
          const user = payload.user || null;
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            authError: null,
          });
          return { success: true, user };
        } catch (error) {
          const message = getErrorMessage(error, 'Registration failed.');
          set({ loading: false, authError: message });
          return { success: false, message };
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, loading: false, authError: null });
        return true;
      },
    }),
    {
      name: 'coderise-auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
