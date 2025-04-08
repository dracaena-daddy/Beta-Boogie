// navigation component
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { href: '/', label: 'Home' },
  { href: '/analyze', label: 'Analyze' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/docs', label: 'Docs' },
  { href: '/login', label: 'Login' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-between p-4 bg-[#1A1A40] text-white shadow-md">
      <div className="text-xl font-bold text-[#9D4EDD]">Beta Boogie</div>
      <div className="flex gap-4 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              'transition-colors hover:text-[#45AFFF]',
              pathname === link.href ? 'text-[#45AFFF] font-semibold underline' : 'text-white'
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
