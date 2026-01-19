'use client';

import { useState } from 'react';
import Form from '@/components/Form';
import Link from 'next/link';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-white font-['Roboto']">
      <main className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-[140px] pt-20 md:pt-32">
        <div className="max-w-md mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {mode === 'login' ? 'Вход' : 'Регистрация'}
            </h1>
            <p className="text-gray-600">
              {mode === 'login'
                ? 'Войдите в свой аккаунт'
                : 'Создайте новый аккаунт'}
            </p>
          </div>

          <Form mode={mode} />

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {mode === 'login'
                ? 'Нет аккаунта? Зарегистрироваться'
                : 'Уже есть аккаунт? Войти'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Вернуться на главную
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
