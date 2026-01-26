'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    // Редирект на страницу входа по умолчанию
    router.push('/auth/signin');
  }, [router]);

  return null;
}
