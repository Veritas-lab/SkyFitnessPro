// hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils'; // ← новая утилита

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

  // Загрузка пользователя при монтировании
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
        return;
      }

      try {
        const res = await api.get('/users/me');
        setState({
          user: res.data,
          isLoading: false,
          error: null,
          isAuthenticated: true,
        });
      } catch (err: unknown) {
        localStorage.removeItem('token');
        const message = getErrorMessage(err);
        setState({
          user: null,
          isLoading: false,
          error: message || 'Сессия истекла',
          isAuthenticated: false,
        });
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await api.post('/auth/login', { email, password });
      const { token } = res.data;

      localStorage.setItem('token', token);
      const userRes = await api.get('/users/me');

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
      await api.post('/auth/register', { email, password });
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