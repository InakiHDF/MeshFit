'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Network, Shirt, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { signOut } from '@/app/actions';

const navItems = [
  { name: 'Wardrobe', href: '/', icon: Shirt },
  { name: 'Nodes', href: '/nodes', icon: Network },
  { name: 'Outfits', href: '/outfits', icon: LayoutGrid },
];

export function Navbar() {
  const pathname = usePathname();

  // Don't show navbar on login page
  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-lg md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-around px-4 md:justify-between">
        <div className="hidden text-xl font-bold tracking-tighter text-white md:block">
          MeshFit
        </div>
        <div className="flex gap-1 md:gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors md:flex-row md:text-sm',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <button
            onClick={() => signOut()}
            className="flex flex-col items-center justify-center gap-1 rounded-lg px-4 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 md:flex-row md:text-sm"
          >
            <LogOut className="h-5 w-5" />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
