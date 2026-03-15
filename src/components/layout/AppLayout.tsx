import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar, { type SidebarUser } from './Sidebar';
import MobileNav from './MobileNav';
import Header from './Header';

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proxy should have caught unauthenticated requests, but guard here too
  if (!user) {
    redirect('/login');
  }

  // Fetch profile for plan — gracefully handle missing row
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan')
    .eq('id', user.id)
    .single();

  const metadata = user.user_metadata as {
    full_name?: string;
    avatar_url?: string;
    email?: string;
  };

  const name =
    profile?.full_name ||
    metadata.full_name ||
    user.email?.split('@')[0] ||
    'User';

  const email = user.email ?? '';
  const avatarUrl = (metadata.avatar_url as string | undefined) ?? null;
  const plan: 'free' | 'pro' = profile?.plan === 'pro' ? 'pro' : 'free';

  const sidebarUser: SidebarUser = {
    name,
    email,
    avatarUrl,
    initials: getInitials(name),
    plan,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar user={sidebarUser} />
      <Header />

      <main className="md:ml-64 min-h-screen bg-slate-50">
        <div className="pt-14 md:pt-0 pb-16 md:pb-0 p-6">
          {children}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
