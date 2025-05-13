import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      set({ user: response.data.user, isAuthenticated: true });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  register: async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      set({ user: response.data.user, isAuthenticated: true });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  logout: async () => {
    try {
      await axios.post('/api/auth/logout');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
  checkAuth: async () => {
    try {
      const response = await axios.get('/api/auth/me');
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

export const useAuth = () => {
  const store = useAuthStore();
  return store;
}; 