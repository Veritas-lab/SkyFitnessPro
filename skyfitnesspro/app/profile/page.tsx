'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    // Редирект на страницу профиля (main)
    router.push('/main');
  }, [router]);

  return null;
}
