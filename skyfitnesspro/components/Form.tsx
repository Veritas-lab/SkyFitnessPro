'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, loginSchema, RegisterFormData, LoginFormData } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface FormProps {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

export default function Form({ mode, onModeChange }: FormProps) {
  const { login, register, error } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const form = mode === 'login' ? loginForm : registerForm;

  const onSubmit = async (data: RegisterFormData | LoginFormData) => {
    setIsLoading(true);
    if (mode === 'login') {
      await login(data.email, data.password);
    } else {
      const registerData = data as RegisterFormData;
      await register(registerData.email, registerData.password);
    }
    setIsLoading(false);
  };

  // Сброс формы при смене режима
  useEffect(() => {
    if (mode === 'login') {
      loginForm.reset();
    } else {
      registerForm.reset();
    }
  }, [mode]);

  return (
    <div
      className="bg-white flex flex-col items-center"
      style={{
        width: '360px',
        height: mode === 'register' ? '520px' : '425px',
        borderRadius: '30px',
        padding: '40px',
        gap: '48px',
      }}
    >
      {/* Логотип */}
      <div className="flex items-center justify-center">
        <Image
          src="/img/logo.svg"
          alt="SkyFitnessPro"
          width={50}
          height={50}
          priority
          style={{
            width: 'auto',
            height: 'auto',
          }}
        />
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full flex flex-col"
        style={{ gap: '16px' }}
      >
        {/* Поле Email / Эл. почта */}
        <div>
          <input
            {...form.register('email')}
            type="email"
            id="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-[30px] focus:ring-2 focus:ring-[#BCEC30] focus:border-transparent outline-none bg-white"
            placeholder={mode === 'login' ? 'Логин' : 'Эл. почта'}
            style={{
              borderRadius: '30px',
            }}
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
          )}
        </div>

        {/* Поле Пароль */}
        <div>
          <input
            {...form.register('password')}
            type="password"
            id="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-[30px] focus:ring-2 focus:ring-[#BCEC30] focus:border-transparent outline-none bg-white"
            placeholder="Пароль"
            style={{
              borderRadius: '30px',
            }}
          />
          {form.formState.errors.password && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>
          )}
        </div>

        {/* Поле Повторите пароль (только для регистрации) */}
        {mode === 'register' && (
          <div>
            <input
              {...form.register('confirmPassword')}
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-3 border border-gray-300 rounded-[30px] focus:ring-2 focus:ring-[#BCEC30] focus:border-transparent outline-none bg-white"
              placeholder="Повторите пароль"
              style={{
                borderRadius: '30px',
              }}
            />
            {form.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Кнопка Войти / Зарегистрироваться */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#BCEC30] hover:bg-[#a8d228] text-black font-medium py-3 px-6 rounded-[30px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            borderRadius: '30px',
          }}
        >
          {isLoading
            ? 'Загрузка...'
            : mode === 'login'
            ? 'Войти'
            : 'Зарегистрироваться'}
        </button>

        {/* Кнопка переключения режима */}
        <button
          type="button"
          onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
          className="w-full bg-white border-2 border-black text-black font-medium py-3 px-6 rounded-[30px] transition-colors hover:bg-gray-50"
          style={{
            borderRadius: '30px',
          }}
        >
          {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
