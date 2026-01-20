'use client';

import { useState } from 'react';
import { useModal } from '@/context/ModalContext';
import Form from '../Form';
import styles from './ModalLogin.module.css';

export default function ModalLogin() {
  const { isLoginOpen, closeLogin } = useModal();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (!isLoginOpen) return null;

  return (
    <div className={styles.overlay} onClick={closeLogin}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={closeLogin}>
          ×
        </button>
        <Form mode={mode} onModeChange={setMode} onSuccess={closeLogin} />
      </div>
    </div>
  );
}
