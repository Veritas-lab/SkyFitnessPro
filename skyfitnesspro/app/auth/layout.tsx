'use client';

import { ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { restoreSession, setUser, setToken } from '@/store/features/authSlice';
import { useRouter, usePathname } from 'next/navigation';
import { usersApi } from '@/lib/api';
import styles from './layout.module.css';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuth } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreSession());
    
    // Загружаем пользователя если есть токен
    const loadUser = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const userRes = await usersApi.getMe();
            dispatch(setUser(userRes.data.email));
            dispatch(setToken(token));
          } catch {
            // Токен невалидный, очищаем
            localStorage.removeItem('token');
          }
        }
      }
    };
    
    loadUser();
  }, [dispatch]);

  useEffect(() => {
    if (isAuth) {
      router.push('/main');
    }
  }, [isAuth, router]);

  // Определяем тип формы (вход или регистрация)
  const isSignin = pathname === '/auth/signin';
  
  // Рассчитываем позицию модального окна в зависимости от его высоты
  const modalHeight = isSignin ? 425 : 487;
  const modalWidth = 360;

  return (
    <div className={styles.wrapper}>
      <div className={styles.containerEnter}>
        <div 
          className={styles.modal__block}
          style={{
            left: `calc(50% - ${modalWidth / 2}px)`,
            top: `calc(50% - ${modalHeight / 2}px)`
          }}
        >
          <div className={`${styles.modal__form} ${isSignin ? styles.signin : styles.signup}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
