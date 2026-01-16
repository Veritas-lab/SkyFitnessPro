// src/components/Header.tsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-primary text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">SkyFitnessPro</Link>
      <nav>
        <ul className="flex space-x-4">
          <li><Link href="/courses">Курсы</Link></li>
          <li><Link href="/profile">Профиль</Link></li>
          <li><button>Войти/Выйти</button></li> {/* Placeholder для auth */}
        </ul>
      </nav>
    </header>
  );
}