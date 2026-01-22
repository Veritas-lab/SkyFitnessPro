'use client';

import styles from './Header.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useAppSelector } from '../../store/store';
import ModalUser from '../ModalUser/ModalUser';
import { useModal } from '../../context/ModalContext';
import Logo from '../Logo/Logo';
import HeaderText from '../HeaderText/HeaderText';

export default function Header() {
  const user = useAppSelector((state) => state.auth.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading] = useState(false);
  const { openLogin } = useModal();
  const toggleModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsModalOpen((prev) => !prev);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header__block}>
        <div className={styles.logoContainer}>
          <Logo />
          <HeaderText />
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
            <span className={styles.header__arrow}>
              <svg
                width="13"
                height="8"
                viewBox="0 0 13 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.0624 0.707154L6.38477 6.38477L0.707152 0.707154"
                  stroke="black"
                  strokeWidth="2"
                />
              </svg>
            </span>
          </div>
        )}
        {user && isModalOpen && (
          <ModalUser onClose={() => {
            console.log('Closing modal');
            setIsModalOpen(false);
          }} />
        )}
      </div>
    </div>
  );
}