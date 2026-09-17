// Top bar shown on every page.

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  ['/', 'Analyse'],
  ['/history', 'History'],
  ['/about', 'About'],
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-20 border-b border-gray-800 bg-gray-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          
          <span className="text-3xl font-semibold tracking-tight text-white">
            Site<span className="text-blue-400">Lens</span>
          </span>
        </Link>

        {/* the pill background makes the active page obvious without shouting */}
        <div className="flex items-center gap-1 rounded-lg bg-gray-900/70 p-1">
          {LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                pathname === href
                  ? 'bg-gray-800 font-medium text-white'
                  : 'text-gray-400 hover:text-white'
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
