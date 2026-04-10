import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  api,
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth
} from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getStoredAuth());
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const token = session.accessToken;
  const refreshToken = session.refreshToken;

  useEffect(() => {
    if (!token) {
      setUser(null);
      setInitializing(false);
      return;
    }

    const loadMe = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (_error) {
        clearStoredAuth();
        setSession({ accessToken: '', refreshToken: '' });
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };

    loadMe();
  }, [token]);

  const storeSession = (tokens, nextUser) => {
    setSession(tokens);
    setUser(nextUser);
    setStoredAuth(tokens);
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload);
    storeSession(
      {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      },
      response.data.user
    );
    return response.data;
  };

  const login = async (payload) => {
    const response = await api.post('/auth/login', payload);
    storeSession(
      {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      },
      response.data.user
    );
    return response.data;
  };

  const logout = async () => {
    const currentRefreshToken = refreshToken;
    try {
      if (currentRefreshToken) {
        await api.post('/auth/logout', { refreshToken: currentRefreshToken });
      }
    } catch (_error) {
      // Force local logout even if server logout fails.
    }

    clearStoredAuth();
    setSession({ accessToken: '', refreshToken: '' });
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    token: session.accessToken,
    refreshToken: session.refreshToken,
    initializing,
    isAuthenticated: Boolean(token && user),
    register,
    login,
    logout
  }), [user, token, session, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
