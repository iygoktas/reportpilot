'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients',   label: 'Clients',   icon: Users },
  { href: '/reports',   label: 'Reports',   icon: FileText },
  { href: '/settings',  label: 'Settings',  icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-20">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-[44px] min-h-[44px]"
            >
              <Icon
                className={`w-6 h-6 ${active ? 'text-orange-600' : 'text-stone-400'}`}
              />
              <span className={`text-xs ${active ? 'text-orange-600' : 'text-stone-400'}`}>
                {label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-orange-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
