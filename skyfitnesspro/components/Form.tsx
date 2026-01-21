'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, loginSchema, RegisterFormData, LoginFormData } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Form.module.css';

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
    } else {
      registerForm.reset();
      registerForm.clearErrors();
    }
  }, [mode, loginForm, registerForm]);

  return (
    <div
      className={`${styles.formContainer} ${
        mode === 'register' ? styles.formContainerRegister : styles.formContainerLogin
      }`}
    >
      {/* Логотип */}
      <div className={styles.logoContainer}>
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
        className={styles.form}
      >
        {/* Поле Email / Эл. почта */}
        <div className={styles.inputWrapper}>
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
            autoComplete={mode === 'login' ? 'email' : 'email'}
            className={`${styles.input} ${
              (mode === 'login' ? loginForm.formState.errors.email : registerForm.formState.errors.email)
                ? styles.inputError
                : ''
            }`}
            placeholder={mode === 'login' ? 'Логин' : 'Эл. почта'}
          />
          {(mode === 'login' ? loginForm.formState.errors.email : registerForm.formState.errors.email) && (
            <p className={styles.errorMessage}>
              {(mode === 'login' ? loginForm.formState.errors.email : registerForm.formState.errors.email)?.message}
            </p>
          )}
        </div>

        {/* Поле Пароль */}
        <div className={styles.inputWrapper}>
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
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className={`${styles.input} ${
              (mode === 'login' ? loginForm.formState.errors.password : registerForm.formState.errors.password)
                ? styles.inputError
                : ''
            }`}
            placeholder="Пароль"
            style={{ paddingRight: '48px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.passwordToggle}
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
            <p className={styles.errorMessage}>
              {(mode === 'login' ? loginForm.formState.errors.password : registerForm.formState.errors.password)?.message}
            </p>
          )}
        </div>

        {/* Поле Повторите пароль (только для регистрации) */}
        {mode === 'register' && (
          <div className={styles.inputWrapper}>
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
              autoComplete="new-password"
              className={`${styles.input} ${
                registerForm.formState.errors.confirmPassword
                  ? styles.inputError
                  : ''
              }`}
              placeholder="Повторите пароль"
              style={{ paddingRight: '48px' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={styles.passwordToggle}
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
              <p className={styles.errorMessage}>{registerForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>
        )}

        {/* Общее сообщение об ошибке (если не привязано к полю) */}
        {error && !(mode === 'login' ? loginForm.formState.errors.email : registerForm.formState.errors.email) && !(mode === 'login' ? loginForm.formState.errors.password : registerForm.formState.errors.password) && !(mode === 'register' && registerForm.formState.errors.confirmPassword) && (
          <div className={styles.errorContainer}>
            <p className={styles.errorContainerText}>{error}</p>
          </div>
        )}

        {/* Кнопка Войти / Зарегистрироваться */}
        <button
          type="submit"
          disabled={isLoading}
          className={styles.primaryButton}
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
          onClick={() => {
            const newMode = mode === 'login' ? 'register' : 'login';
            setShowPassword(false);
            if (newMode === 'register') {
              setShowConfirmPassword(false);
            }
            onModeChange(newMode);
          }}
          className={styles.secondaryButton}
        >
          {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
