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
  onSuccess?: () => void;
}

export default function Form({ mode, onModeChange, onSuccess }: FormProps) {
  const { login, register, error } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit', // Валидация только при отправке формы
    reValidateMode: 'onBlur', // Повторная валидация при потере фокуса после первой попытки
    shouldFocusError: false, // Не фокусироваться на ошибке автоматически
  });
  
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit', // Валидация только при отправке формы
    reValidateMode: 'onBlur', // Повторная валидация при потере фокуса после первой попытки
    shouldFocusError: false, // Не фокусироваться на ошибке автоматически
  });

  // Используем правильную форму в зависимости от режима
  const currentForm = mode === 'login' ? loginForm : registerForm;

  // Функция для определения типа ошибки и привязки к полю
  // Согласно документации API:
  // Ошибки Email: "Введите корректный Email", "Пользователь с таким email уже существует", "Пользователь с таким email не найден"
  // Ошибки пароля: "Пароль должен содержать не менее 6 симоволов", "Пароль должен содержать не менее 2 спецсимволов",
  // "Пароль должен содержать как минимум одну заглавную букву", "Неверный пароль"
  const parseApiError = (errorMessage: string): { field: 'email' | 'password' | null; message: string } => {
    if (!errorMessage) return { field: null, message: errorMessage };

    const lowerError = errorMessage.toLowerCase();

    // Ошибки Email согласно документации API
    if (
      lowerError.includes('email') ||
      lowerError.includes('почта') ||
      lowerError.includes('почта уже используется') ||
      lowerError.includes('пользователь с таким email') ||
      lowerError.includes('пользователь не найден') ||
      lowerError.includes('введите корректный email') ||
      lowerError.includes('данная почта')
    ) {
      return { field: 'email', message: errorMessage };
    }

    // Ошибки пароля согласно документации API
    if (
      lowerError.includes('пароль') ||
      lowerError.includes('неверный пароль') ||
      lowerError.includes('пароль введен неверно') ||
      lowerError.includes('симоволов') ||
      lowerError.includes('символов') ||
      lowerError.includes('спецсимволов') ||
      lowerError.includes('заглавную букву') ||
      lowerError.includes('заглавную')
    ) {
      return { field: 'password', message: errorMessage };
    }

    return { field: null, message: errorMessage };
  };

  // Устанавливаем ошибки API в соответствующие поля формы
  useEffect(() => {
    if (error) {
      const parsedError = parseApiError(error);
      if (parsedError.field) {
        if (mode === 'login') {
          loginForm.setError(parsedError.field as 'email' | 'password', {
            type: 'server',
            message: parsedError.message,
          });
        } else {
          registerForm.setError(parsedError.field as 'email' | 'password', {
            type: 'server',
            message: parsedError.message,
          });
        }
      }
    }
  }, [error, mode, loginForm, registerForm]);

  const onSubmit = async (data: RegisterFormData | LoginFormData) => {
    setIsLoading(true);
    // Очищаем предыдущие ошибки
    if (mode === 'login') {
      loginForm.clearErrors();
    } else {
      registerForm.clearErrors();
    }
    
    let success = false;
    if (mode === 'login') {
      success = await login(data.email, data.password);
    } else {
      const registerData = data as RegisterFormData;
      success = await register(registerData.email, registerData.password);
    }
    setIsLoading(false);

    if (success && onSuccess) {
      onSuccess();
    }
  };

  // Сброс формы и очистка ошибок при смене режима
  useEffect(() => {
    if (mode === 'login') {
      loginForm.reset();
      loginForm.clearErrors();
      setShowPassword(false);
    } else {
      registerForm.reset();
      registerForm.clearErrors();
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [mode, loginForm, registerForm]);

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
          loading="eager"
          priority
          style={{
            width: 'auto',
            height: 'auto',
          }}
        />
      </div>

      <form
        onSubmit={currentForm.handleSubmit(onSubmit)}
        className="w-full flex flex-col"
        style={{ gap: '16px' }}
      >
        {/* Поле Email / Эл. почта */}
        <div>
          <input
            {...(mode === 'login' 
              ? loginForm.register('email', {
                  onChange: () => {
                    if (loginForm.formState.errors.email) {
                      loginForm.clearErrors('email');
                    }
                  },
                })
              : registerForm.register('email', {
                  onChange: () => {
                    if (registerForm.formState.errors.email) {
                      registerForm.clearErrors('email');
                    }
                  },
                })
            )}
            type="email"
            id="email"
            className={`w-full px-4 py-3 border rounded-[30px] focus:ring-2 focus:ring-[#BCEC30] focus:border-transparent outline-none bg-white ${
              (mode === 'login' ? loginForm.formState.errors.email : registerForm.formState.errors.email)
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder={mode === 'login' ? 'Логин' : 'Эл. почта'}
            style={{
              borderRadius: '30px',
            }}
          />
          {(mode === 'login' ? loginForm.formState.errors.email : registerForm.formState.errors.email) && (
            <p className="mt-1 text-sm text-red-600">
              {(mode === 'login' ? loginForm.formState.errors.email : registerForm.formState.errors.email)?.message}
            </p>
          )}
        </div>

        {/* Поле Пароль */}
        <div className="relative">
          <input
            {...(mode === 'login'
              ? loginForm.register('password', {
                  onChange: () => {
                    if (loginForm.formState.errors.password) {
                      loginForm.clearErrors('password');
                    }
                  },
                })
              : registerForm.register('password', {
                  onChange: () => {
                    if (registerForm.formState.errors.password) {
                      registerForm.clearErrors('password');
                    }
                  },
                })
            )}
            type={showPassword ? 'text' : 'password'}
            id="password"
            className={`w-full px-4 py-3 pr-12 border rounded-[30px] focus:ring-2 focus:ring-[#BCEC30] focus:border-transparent outline-none bg-white ${
              (mode === 'login' ? loginForm.formState.errors.password : registerForm.formState.errors.password)
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="Пароль"
            style={{
              borderRadius: '30px',
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
          {(mode === 'login' ? loginForm.formState.errors.password : registerForm.formState.errors.password) && (
            <p className="mt-1 text-sm text-red-600">
              {(mode === 'login' ? loginForm.formState.errors.password : registerForm.formState.errors.password)?.message}
            </p>
          )}
        </div>

        {/* Поле Повторите пароль (только для регистрации) */}
        {mode === 'register' && (
          <div className="relative">
            <input
              {...registerForm.register('confirmPassword', {
                onChange: () => {
                  if (registerForm.formState.errors.confirmPassword) {
                    registerForm.clearErrors('confirmPassword');
                  }
                },
              })}
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              className={`w-full px-4 py-3 pr-12 border rounded-[30px] focus:ring-2 focus:ring-[#BCEC30] focus:border-transparent outline-none bg-white ${
                registerForm.formState.errors.confirmPassword
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              placeholder="Повторите пароль"
              style={{
                borderRadius: '30px',
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showConfirmPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
            {registerForm.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>
        )}

        {/* Общее сообщение об ошибке (если не привязано к полю) */}
        {error && !(mode === 'login' ? loginForm.formState.errors.email : registerForm.formState.errors.email) && !(mode === 'login' ? loginForm.formState.errors.password : registerForm.formState.errors.password) && !(mode === 'register' && registerForm.formState.errors.confirmPassword) && (
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
