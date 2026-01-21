'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  isLoginModalOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLogin = () => setIsLoginModalOpen(true);
  const closeLogin = () => setIsLoginModalOpen(false);

  return (
    <ModalContext.Provider value={{ isLoginModalOpen, openLogin, closeLogin }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
