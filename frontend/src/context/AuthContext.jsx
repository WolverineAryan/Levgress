import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in LocalStorage and restore user session
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Refresh user data from server to ensure it is accurate
          const res = await api.get('/auth/me');
          setUser(res.data.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
        } catch (error) {
          console.error('Failed to restore user session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: loggedUser } = res.data.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const { token, user: registeredUser } = res.data.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(registeredUser));
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateLocalUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const loginWithGoogle = async (role) => {
    let idToken;
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

    if (apiKey && apiKey !== 'mock-api-key') {
      try {
        const { signInWithPopup } = await import('firebase/auth');
        const { auth, googleProvider } = await import('../config/firebase');
        const result = await signInWithPopup(auth, googleProvider);
        idToken = await result.user.getIdToken();
      } catch (err) {
        console.error('Firebase Google Auth Popup failed:', err);
        throw err;
      }
    } else {
      // Developer Mock Mode
      const mockEmail = prompt(
        'Firebase not configured. Enter a mock Gmail address for local testing:',
        'google_student@levgress.com'
      );
      if (!mockEmail) {
        throw new Error('Google Sign-in cancelled by user.');
      }
      idToken = mockEmail;
    }

    const res = await api.post('/auth/firebase-login', { idToken, role });
    const { token, user: loggedUser } = res.data.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateLocalUser, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
