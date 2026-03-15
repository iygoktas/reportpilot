'use client';

import { usePathname } from 'next/navigation';

// Map route prefixes to human-readable page titles
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clients':   'Clients',
  '/reports':   'Reports',
  '/settings':  'Settings',
};

function getPageTitle(pathname: string): string {
  for (const [prefix, title] of Object.entries(pageTitles)) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return title;
    }
  }
  return 'ReportPilot';
}

export default function Header() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-20 h-14 flex items-center px-4 gap-3">
      <span className="text-base font-bold text-slate-800">ReportPilot</span>
      <span className="text-slate-300">/</span>
      <span className="text-sm font-medium text-slate-600">{pageTitle}</span>
    </header>
  );
}
