'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { ModalProvider } from '@/context/ModalContext';
import { ReactNode } from 'react';
import ModalLogin from '@/components/ModalLogin/ModalLogin';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ModalProvider>
        {children}
        <ModalLogin />
      </ModalProvider>
    </Provider>
  );
}
