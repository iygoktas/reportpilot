'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, BarChart3, LogOut } from 'lucide-react';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients',   label: 'Clients',   icon: Users },
  { href: '/reports',   label: 'Reports',   icon: FileText },
  { href: '/settings',  label: 'Settings',  icon: Settings },
];

export interface SidebarUser {
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
  plan: 'free' | 'pro';
}

interface SidebarProps {
  user: SidebarUser;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex-col z-20">
      {/* Blue accent line at top */}
      <div className="h-[2px] bg-blue-500 shrink-0" />

      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <span className="text-2xl font-semibold text-slate-800 tracking-tight">ReportPilot</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={
                active
                  ? 'flex items-center gap-3 pl-[9px] pr-3 py-2.5 rounded-lg bg-blue-50/70 text-blue-600 font-medium border-l-[3px] border-blue-500 transition-all duration-200'
                  : 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200'
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-base font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="px-3 pb-2 border-t border-slate-200 pt-4">
        <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
          {/* Avatar: Google picture or initials */}
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-9 h-9 rounded-full shrink-0 object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-white">{user.initials}</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-slate-700 truncate leading-tight">
              {user.name}
            </p>
            <p className="text-sm text-slate-400 truncate leading-tight">{user.email}</p>
          </div>

          {user.plan === 'pro' ? (
            <span className="bg-blue-100 text-blue-700 text-sm font-medium px-2 py-0.5 rounded-full shrink-0">
              Pro
            </span>
          ) : (
            <span className="bg-slate-100 text-slate-500 text-sm font-medium px-2 py-0.5 rounded-full shrink-0">
              Free
            </span>
          )}
        </div>
      </div>

      {/* Sign out */}
      <div className="px-3 pb-4">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
