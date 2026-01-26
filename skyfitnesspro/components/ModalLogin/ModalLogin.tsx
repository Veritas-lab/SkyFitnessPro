'use client';

import { useState, useEffect } from 'react';
import { useModal } from '@/context/ModalContext';
import styles from './ModalLogin.module.css';
import { useAppSelector } from '@/store/store';
import Form from '../Form';

export default function ModalLogin() {
  const { isLoginModalOpen, closeLogin } = useModal();
  const { isAuth } = useAppSelector((state) => state.auth);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (isAuth && isLoginModalOpen) {
      closeLogin();
    }
  }, [isAuth, isLoginModalOpen, closeLogin]);

  if (!isLoginModalOpen) return null;

  const handleSuccess = () => {
    closeLogin();
  };

  return (
    <div className={styles.modalOverlay} onClick={closeLogin}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={closeLogin}>
          ×
        </button>
        <Form mode={mode} onModeChange={setMode} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}