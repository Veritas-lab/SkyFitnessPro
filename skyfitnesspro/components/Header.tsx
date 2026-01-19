'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { isAuthenticated, logout, isLoading } = useAuth();

  // Показываем простой заголовок во время загрузки
  if (isLoading) {
  return (
      <header 
        className="bg-white border-b shadow-sm relative"
        style={{
          width: '1160px',
          height: '120px',
          position: 'absolute',
          top: '0px',
          left: '140px',
        }}
      >
        <div 
          className="flex flex-col items-start"
          style={{
            position: 'absolute',
            top: '50px',
            left: '0px',
          }}
        >
          <div className="h-[35px] w-[220px] bg-gray-200 animate-pulse rounded" />
        </div>
        <div 
          style={{
            position: 'absolute',
            top: '50px',
            right: '0px',
          }}
        >
          <div className="h-[52px] w-[103px] bg-gray-200 animate-pulse rounded-full" />
        </div>
      </header>
    );
  }

  return (
    <header 
      className="bg-white border-b shadow-sm relative"
      style={{
        width: '1160px',
        height: '120px',
        marginBottom: '60px',
        position: 'absolute',
        top: '0px',
        left: '140px',
      }}
    >
      {/* Левая часть: логотип + текст */}
      <div 
        className="flex flex-col items-start"
        style={{
          position: 'absolute',
          top: '50px',
          left: '0px',
        }}
      >
        <Link href="/">
          <Image
            src="/img/logo.svg"
            alt="SkyFitnessPro"
            width={220}
            height={35}
            priority
            className="cursor-pointer"
            style={{
              width: '220px',
              height: '35px',
            }}
          />
        </Link>
        <span
          className="hidden md:block"
          style={{
            fontFamily: 'Roboto',
            fontWeight: 400,
            fontSize: '18px',
            lineHeight: '110%',
            letterSpacing: '0px',
            color: '#000000',
            marginTop: '15px',
          }}
        >
          Онлайн-тренировки для занятий дома
        </span>
      </div>

      {/* Правая часть: кнопки */}
      <div 
        className="flex items-center"
        style={{
          position: 'absolute',
          top: '50px',
          right: '0px',
        }}
      >
        {isAuthenticated ? (
          <>
            <Link
              href="/profile"
              className="
                px-6 py-3
                rounded-[46px]
                bg-gray-100
                text-black
                font-medium
                hover:bg-gray-200
                transition-all duration-200
              "
            >
              Профиль
            </Link>
            <button
              onClick={logout}
              className="
                px-6 py-3
                rounded-[46px]
                bg-[#BCEC30]
                text-black
                font-medium
                hover:bg-[#a8d228]
                transition-all duration-200
                shadow-sm hover:shadow-md
              "
            >
              Выйти
            </button>
          </>
        ) : (
          <Link
            href="/auth"
            className="flex items-center justify-center text-black font-medium hover:bg-[#a8d228] transition-all duration-200 shadow-sm hover:shadow-md"
            style={{
              width: '103px',
              height: '52px',
              borderRadius: '46px',
              paddingTop: '16px',
              paddingRight: '26px',
              paddingBottom: '16px',
              paddingLeft: '26px',
              gap: '8px',
              background: '#BCEC30',
              opacity: 1,
            }}
          >
            Войти
          </Link>
        )}
      </div>
    </header>
  );
}
