
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="flex items-start justify-between px-6 py-4 bg-white border-b shadow-sm relative">
      {/* Левая часть: логотип + текст */}
      <div className="flex flex-col items-start mt-[50px] ml-[140px]">
        <Image
          src="/img/logo.svg"
          alt="SkyFitnessPro"
          width={220}
          height={35}
          priority
        />
        <span
          className="
            mt-[15px]
            hidden md:block
            font-['Roboto']
            font-normal
            text-[18px]
            leading-[110%]
            text-gray-600
          "
        >
          Онлайн-тренировки для занятий дома
        </span>
      </div>

      {/* Кнопка "Войти" — ТОЧНО по макету */}
      <Link
        href="/login"
        className="
          absolute                    /* позиционирование по макету */
          top-[50px]                  /* top: 50px */
          left-[1197px]               /* left: 1197px */
          w-[103px]                   /* width: 103px */
          h-[52px]                    /* height: 52px */
          rounded-[46px]              /* border-radius: 46px */
          pt-[16px] px-[26px] pb-[16px]  /* padding: 16px 26px 16px */
          flex items-center justify-center gap-[8px]  /* gap: 8px + центрирование */
          bg-[#BCEC30]                /* background: #BCEC30 */
          text-black                   /* текст чёрный (подбери по макету) */
          font-medium
          hover:bg-[#a8d228]          /* hover эффект чуть темнее */
          transition-all duration-200
          opacity-100                 /* opacity: 1 */
          shadow-sm hover:shadow-md
        "
      >
        Войти
      </Link>
    </header>
  );
}