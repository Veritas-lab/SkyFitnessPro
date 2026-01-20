'use client';

import styles from './signup.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { register, clearError } from '@/store/features/authSlice';

export default function Signup() {
  const dispatch = useAppDispatch();
  const { error, loading } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim() || !repeat.trim()) {
      alert('Заполните все поля');
      return;
    }

    if (password !== repeat) {
      alert('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      alert('Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      const result = await dispatch(register({ email, password }));
      
      if (register.fulfilled.match(result)) {
        // Редирект произойдет автоматически через layout
      }
    } catch {}
  };

  return (
    <>
      <Link href="/">
        <div className={styles.modal__logo}>
          <Image
            src="/img/logo.svg"
            alt="SkyFitnessPro"
            width={220}
            height={35}
            priority
          />
        </div>
      </Link>
      <form onSubmit={handleRegister} className={styles.modal__form}>
        <input
          className={`${styles.modal__input} ${styles.login}`}
          type="text"
          placeholder="Эл. почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          className={styles.modal__input}
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          minLength={6}
        />
        <input
          className={styles.modal__input}
          type="password"
          placeholder="Повторите пароль"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          required
          disabled={loading}
          minLength={6}
        />
        <button
          type="submit"
          disabled={loading}
          className={styles.modal__btnSignupEnt}
        >
          {loading ? 'Загрузка...' : 'Зарегистрироваться'}
        </button>
      </form>
    </>
  );
}