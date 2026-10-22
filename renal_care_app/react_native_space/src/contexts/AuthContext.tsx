import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authControllerLogin, authControllerMe } from '@/src/api/generated/api';
import { useQueryClient } from '@tanstack/react-query';
import { AUTH_TOKEN_KEY, getErrorMessage } from '@/src/api/customFetch';
import type { UserDto } from '@/src/api/generated/schemas';

interface AuthContextType {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          const res = await authControllerMe();
          if (mounted) setUser(res?.user ?? null);
        }
      } catch {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      const res = await authControllerLogin({ email, password });
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, res?.token ?? '');
      setUser(res?.user ?? null);
    } catch (e) {
      throw new Error(getErrorMessage(e, 'Credenciales incorrectas'));
    }
  }, [queryClient]);

  const logout = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
