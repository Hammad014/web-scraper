

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  ['/', 'Scraper'],
  ['/history', 'History'],
  ['/about', 'About'],
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950/80 px-4 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <Link href="/" className="text-lg font-bold text-white">
          Web<span className="text-blue-500">Scraper</span>
        </Link>

        <div className="flex items-center gap-1">
          {LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                pathname === href
                  ? 'bg-gray-800 font-medium text-white'
                  : 'text-gray-500 hover:text-gray-200'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
