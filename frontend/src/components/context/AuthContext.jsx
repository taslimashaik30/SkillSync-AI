import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const messageFromError = (err, fallback) => {
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg).filter(Boolean).join(', ') || fallback;
  if (!err.response) return 'Unable to reach the server. Please try again.';
  if (err.response.status >= 500) return 'The server encountered an error. Please try again later.';
  if (err.response.status === 422) return 'Please check the submitted information and try again.';
  return fallback;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const response = await authAPI.getProfile();
        if (active) setUser(response.data);
      } catch {
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setAuthLoading(false);
      }
    };
    restoreSession();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('token', access_token);
      const profile = await authAPI.getProfile();
      setToken(access_token);
      setUser(profile.data);
      return { success: true, user: profile.data || userData };
    } catch (err) {
      localStorage.removeItem('token');
      return {
        success: false,
        error: messageFromError(err, 'Login failed. Please try again.'),
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(userData);
      return { success: true, user: res.data };
    } catch (err) {
      return {
        success: false,
        error: messageFromError(err, 'Registration failed. Please try again.'),
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    try {
      const res = await authAPI.updateProfile(data);
      setUser(res.data);
      return { success: true, user: res.data };
    } catch (err) {
      return {
        success: false,
        error: messageFromError(err, 'Failed to update profile.'),
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, authLoading, login, register, logout, updateProfile, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};
