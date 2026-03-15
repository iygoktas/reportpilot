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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex-col z-20">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-200">
        <span className="text-xl font-bold text-slate-800">ReportPilot</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={
                active
                  ? 'flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium'
                  : 'flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors'
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="px-3 py-4 border-t border-slate-200">
        <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
          {/* Avatar with initials */}
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-white">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">John Doe</p>
          </div>
          <span className="bg-slate-100 text-slate-500 text-xs font-medium px-2 py-0.5 rounded-full shrink-0">
            Free
          </span>
        </div>
      </div>
    </aside>
  );
}
