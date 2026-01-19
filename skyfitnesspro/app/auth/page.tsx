'use client';

import { useState } from 'react';
import Form from '@/components/Form';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen font-['Roboto']" style={{ background: '#1a1a1a' }}>
      <main className="flex items-center justify-center min-h-screen">
        <Form mode={mode} onModeChange={setMode} />
      </main>
    </div>
  );
}
