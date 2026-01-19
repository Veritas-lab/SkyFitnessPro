// hooks/useAuth.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, usersApi } from '@/lib/api';
import { User } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
  });

  const router = useRouter();
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  // Загрузка пользователя при монтировании
  useEffect(() => {
    // Проверяем, что мы в браузере
    if (typeof window === 'undefined') {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Защита от множественных одновременных запросов
    if (loadingRef.current) return;
    
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (mountedRef.current) {
          setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
        }
        return;
      }

      try {
        loadingRef.current = true;
        const res = await usersApi.getMe();
        if (mountedRef.current) {
          setState({
            user: res.data,
            isLoading: false,
            error: null,
            isAuthenticated: true,
          });
        }
      } catch (err: unknown) {
        localStorage.removeItem('token');
        const message = getErrorMessage(err);
        if (mountedRef.current) {
          setState({
            user: null,
            isLoading: false,
            error: message || 'Сессия истекла',
            isAuthenticated: false,
          });
        }
      } finally {
        loadingRef.current = false;
      }
    };

    loadUser();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await authApi.login(email, password);
      const { token } = res.data;

      localStorage.setItem('token', token);
      const userRes = await usersApi.getMe();

      setState({
        user: userRes.data,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      });

      router.push('/profile');
      return true;
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      return false;
    }
  }, [router]);

  const register = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await authApi.register(email, password);
      // После успешной регистрации сразу логинимся
      return await login(email, password);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      return false;
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setState({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
    });
    router.push('/');
  }, [router]);

  return {
    ...state,
    login,
    register,
    logout,
  };
}