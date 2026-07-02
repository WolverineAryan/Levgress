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

  const loginWithProvider = async (providerName, role, mockEmail) => {
    let idToken;
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

    if (apiKey && apiKey !== 'mock-api-key') {
      try {
        const { signInWithPopup } = await import('firebase/auth');
        const { auth } = await import('../config/firebase');
        
        let provider;
        if (providerName === 'github') {
          const { GithubAuthProvider } = await import('firebase/auth');
          provider = new GithubAuthProvider();
        } else {
          const { GoogleAuthProvider } = await import('firebase/auth');
          provider = new GoogleAuthProvider();
        }

        const result = await signInWithPopup(auth, provider);
        idToken = await result.user.getIdToken();
      } catch (err) {
        console.error(`Firebase ${providerName} Auth Popup failed:`, err);
        if (import.meta.env.PROD) {
          throw new Error(`Authentication popup failed: ${err.message}`);
        }
        const mockEmailInput = mockEmail || prompt(
          `Firebase Auth failed (${err.message}). Falling back to developer mock mode. Enter a mock email address for local testing:`,
          providerName === 'github' ? 'new_github_student@levgress.com' : 'new_google_student@levgress.com'
        );
        if (!mockEmailInput) {
          throw err;
        }
        idToken = mockEmailInput;
      }
    } else {
      if (import.meta.env.PROD) {
        throw new Error(`Authentication system is not configured. Please contact the administrator.`);
      }
      // Developer Mock Mode
      const mockEmailInput = mockEmail || prompt(
        `Firebase not configured. Enter a mock email address for ${providerName} local testing:`,
        providerName === 'github' ? 'github_student@levgress.com' : 'google_student@levgress.com'
      );
      if (!mockEmailInput) {
        throw new Error(`${providerName} Sign-in cancelled by user.`);
      }
      idToken = mockEmailInput;
    }

    const res = await api.post('/auth/firebase-login', { idToken, role });

    if (res.data.data.twoFactorRequired) {
      // Store the temporary token so that verify-2fa request has auth headers
      localStorage.setItem('token', res.data.data.tempToken);
      return {
        twoFactorRequired: true,
        tempToken: res.data.data.tempToken,
        userId: res.data.data.userId,
        email: res.data.data.email
      };
    }

    const { token, user: loggedUser } = res.data.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  };

  const complete2FA = async (totpToken) => {
    try {
      const res = await api.post('/auth/verify-2fa', { token: totpToken });
      const { token, user: loggedUser } = res.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      localStorage.removeItem('token');
      throw err;
    }
  };

  const loginWithGoogle = (role) => loginWithProvider('google', role);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateLocalUser, loginWithGoogle, loginWithProvider, complete2FA }}>
      {children}
    </AuthContext.Provider>
  );
};
