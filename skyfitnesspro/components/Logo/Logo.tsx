'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './Logo.module.css';

export default function Logo() {
  return (
    <Link href="/" className={styles.logoLink}>
      <Image
        src="/img/logo.svg"
        alt="SkyFitness Pro"
        width={220}
        height={35}
        loading="eager"
        className={styles.logo}
      />
    </Link>
  );
}