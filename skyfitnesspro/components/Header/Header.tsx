'use client';

import styles from './Header.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useAppSelector } from '../../store/store';
import ModalUser from '../ModalUser/ModalUser';
import { useModal } from '../../context/ModalContext';

export default function Header() {
  const user = useAppSelector((state) => state.auth.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading] = useState(false);
  const { openLogin } = useModal();
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header__block}>
        <div>
          <Link href="/">
            <Image
              src="/img/logo.svg"
              alt="logo"
              width={220}
              height={35}
              loading="eager"
              priority
              style={{
                width: 'auto',
                height: 'auto',
              }}
            />
          </Link>
          <p className={styles.header__text}>
            Онлайн-тренировки для занятий дома
          </p>
        </div>
        {!user && (
          <button
            disabled={isLoading}
            onClick={openLogin}
            className={styles.button}
          >
            Войти
          </button>
        )}
        {user && (
          <div className={styles.header__user} onClick={toggleModal}>
            <Image
              src="/img/Profile.svg"
              alt="profile"
              width={50}
              height={50}
            />
            <p className={styles.header__userText}>{user}</p>
          </div>
        )}
        {user && (isModalOpen ? <ModalUser /> : null)}
      </div>
    </div>
  );
}