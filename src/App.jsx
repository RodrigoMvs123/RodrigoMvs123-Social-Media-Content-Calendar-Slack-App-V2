import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import useStore from './store/useStore';
import { useEffect } from 'react';
import React from 'react';

// Lazy load pages
const Posts = React.lazy(() => import('./pages/Posts'));
const Login = React.lazy(() => import('./pages/Login'));

export default function App() {
  const { isAuthenticated, user, login } = useStore();

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and get user info
      login();
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <React.Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/posts" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route path="/login" element={<Login />} />
              <Route
                path="/posts"
                element={
                  <ProtectedRoute>
                    <Posts />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </React.Suspense>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
} 