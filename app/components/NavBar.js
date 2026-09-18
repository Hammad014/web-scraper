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
      {/* full width on purpose, so the bar spans the window instead of lining up with the content box */}
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
            S
          </span>
          {/* on the very smallest phones the logo square alone has to do the job */}
          <span className="hidden text-lg font-semibold tracking-tight text-white min-[360px]:inline">
            Site<span className="text-blue-400">Lens</span>
          </span>
        </Link>

        {/* the pill background makes the active page obvious without shouting */}
        <div className="flex items-center gap-1 rounded-lg bg-gray-900/70 p-1">
          {LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-2.5 py-1.5 text-sm transition-colors sm:px-3 ${
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
