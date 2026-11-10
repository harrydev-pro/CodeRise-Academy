import { create } from 'zustand';
import { apiClient } from '../services/api/client';

function payloadData(result) {
  return result?.data?.data || result?.data || {};
}

function getUser(result) {
  const payload = payloadData(result);
  const user = payload.user || payload;
  if (!user || typeof user !== 'object' || Array.isArray(user)) return null;
  return { ...user, fullName: user.fullName || user.name || user.full_name };
}

function resultFailure(result, fallback) {
  return {
    success: false,
    message: result?.error || fallback,
    status: result?.status,
  };
}

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  initializing: false,
  authError: null,

  initialize: async () => {
    if (get().initializing) return;
    // Keep showing the page while refreshing an already signed-in account.
    set({ loading: !get().user, initializing: true, authError: null });
    try {
      const result = await apiClient('/auth/me');
      if (!result.ok) {
        set({ user: null, isAuthenticated: false, loading: false, initializing: false });
        return;
      }
      const user = getUser(result);
      if (!user) throw new Error('The current-user endpoint returned an invalid user.');
      set({ user, isAuthenticated: true, loading: false, initializing: false, authError: null });
    } catch (error) {
      set({ user: null, isAuthenticated: false, loading: false, initializing: false, authError: error.message });
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
        set({ user: null, isAuthenticated: false, loading: false, authError: result.error });
        return resultFailure(result, 'Invalid email or password.');
      }
      const user = getUser(result);
      if (!user) throw new Error('The login response did not include an account.');
      set({ user, isAuthenticated: true, loading: false, authError: null });
      return { success: true, user };
    } catch (error) {
      set({ user: null, isAuthenticated: false, loading: false, authError: error.message });
      return { success: false, message: error.message || 'Unable to sign in.' };
    }
  },

  register: async ({ fullName, email, phone, password }) => {
    set({ loading: true, authError: null });
    try {
      const result = await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: fullName, email, phone_number: phone, password }),
      });
      if (!result.ok) {
        set({ loading: false, authError: result.error });
        return resultFailure(result, 'Unable to create your account.');
      }
      set({ user: null, isAuthenticated: false, loading: false, authError: null });
      return { success: true, user: payloadData(result).user || null };
    } catch (error) {
      set({ loading: false, authError: error.message });
      return { success: false, message: error.message || 'Registration failed.' };
    }
  },

  updateProfile: async ({ fullName, phone, avatarUrl }) => {
    try {
      const result = await apiClient('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: fullName, phone_number: phone, ...(avatarUrl === undefined ? {} : { avatar_url: avatarUrl }) }),
      });
      if (!result.ok) return resultFailure(result, 'Unable to update your profile.');
      const user = getUser(result);
      if (!user) throw new Error('The profile response did not include an account.');
      set({ user, isAuthenticated: true, authError: null });
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.message || 'Unable to update your profile.' };
    }
  },

  logout: async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Always clear the in-memory identity locally if the server cannot be reached.
    } finally {
      set({ user: null, isAuthenticated: false, loading: false, authError: null });
    }
    return true;
  },
}));
