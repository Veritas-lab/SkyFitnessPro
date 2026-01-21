'use client';

import { useAppDispatch, useAppSelector } from '@/store/store';
import { logout } from '@/store/features/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './ModalUser.module.css';

export default function ModalUser() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    router.push('/');
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <Link href="/users/me/courses" className={styles.modalLink}>
          Мой профиль
        </Link>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Выйти
        </button>
      </div>
    </div>
  );
}
