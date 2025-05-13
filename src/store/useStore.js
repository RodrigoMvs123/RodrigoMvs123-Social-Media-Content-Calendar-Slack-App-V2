import { create } from 'zustand';
import axios from 'axios';

const useStore = create((set) => ({
  // Auth State
  user: null,
  isAuthenticated: false,
  
  // Posts State
  posts: [],
  loading: false,
  error: null,

  // Auth Actions
  login: async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      set({ user, isAuthenticated: true });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Login failed' });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, isAuthenticated: false });
  },

  // Posts Actions
  fetchPosts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get('/api/posts');
      set({ posts: response.data, loading: false, error: null });
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch posts',
        loading: false
      });
    }
  },

  createPost: async (postData) => {
    set({ loading: true });
    try {
      const response = await axios.post('/api/posts', postData);
      set(state => ({
        posts: [...state.posts, response.data],
        loading: false,
        error: null
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to create post',
        loading: false
      });
      throw error;
    }
  },

  updatePost: async (id, postData) => {
    set({ loading: true });
    try {
      const response = await axios.put(`/api/posts/${id}`, postData);
      set(state => ({
        posts: state.posts.map(post =>
          post.id === id ? response.data : post
        ),
        loading: false,
        error: null
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to update post',
        loading: false
      });
      throw error;
    }
  },

  deletePost: async (id) => {
    set({ loading: true });
    try {
      await axios.delete(`/api/posts/${id}`);
      set(state => ({
        posts: state.posts.filter(post => post.id !== id),
        loading: false,
        error: null
      }));
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to delete post',
        loading: false
      });
      throw error;
    }
  },

  // Error Handling
  clearError: () => set({ error: null })
}));

export default useStore; 