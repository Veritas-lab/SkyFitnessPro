'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store/store';
import { logout } from '@/store/features/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import styles from './ModalUser.module.css';

// Функция для получения имени пользователя из email
const getUserName = (email: string | null | undefined): string => {
  if (!email) return '';
  const namePart = email.split('@')[0];
  // Убираем точки и делаем первую букву заглавной
  const name = namePart.split('.').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  ).join(' ');
  return name;
};

interface ModalUserProps {
  onClose?: () => void;
}

export default function ModalUser({ onClose }: ModalUserProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, logout: logoutAuth } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  // Закрытие модального окна при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    // Добавляем обработчик с небольшой задержкой, чтобы не закрыть сразу при открытии
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleLogout = () => {
    dispatch(logout());
    logoutAuth();
    onClose?.();
  };

  const handleProfileClick = () => {
    onClose?.();
  };

  const userName = getUserName(user?.email);
  const userEmail = user?.email || '';

  return (
    <div className={styles.modal} ref={modalRef}>
      <div className={styles.modalContent}>
        <div className={styles.userInfo}>
          <h3 className={styles.userName}>{userName}</h3>
          <p className={styles.userEmail}>{userEmail}</p>
        </div>
        <Link href="/profile" className={styles.profileButton} onClick={handleProfileClick}>
          Мой профиль
        </Link>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Выйти
        </button>
      </div>
    </div>
  );
}
