import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import * as usersApi from '../api/users';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../api/tokenStore';
import { onSessionExpired } from '../api/authEvents';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(getAccessToken()));

  useEffect(() => {
    if (!getAccessToken()) return;
    let active = true;
    usersApi
      .getMe()
      .then((profile) => {
        if (active) setUser(profile);
      })
      .catch(() => clearTokens())
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => onSessionExpired(() => setUser(null)), []);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    setTokens(data);
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (payload) => {
    const data = await authApi.signup(payload);
    setTokens(data);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      await authApi.logout(refreshToken ? { refreshToken } : undefined);
    } catch {
      // Revoking server-side is best effort; the local session always ends.
    } finally {
      clearTokens();
      setUser(null);
      // Drop every cached response so the next visitor never sees the
      // previous account's personalized data.
      queryClient.clear();
    }
  }, [queryClient]);

  const value = useMemo(
    () => ({ user, isLoading, login, signup, logout, setUser }),
    [user, isLoading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
