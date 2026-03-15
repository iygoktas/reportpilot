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

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
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
    <div className="min-h-screen bg-stone-50">
      <Sidebar user={sidebarUser} />
      <Header />

      <main className="md:ml-64 min-h-screen bg-stone-50">
        {/*
          Mobile:  px-4 sides, pt-20 clears the 56px fixed header + 24px gap,
                   pb-24 clears the 64px fixed bottom nav + 32px gap
          Desktop: px-6 sides, pt-8 breathing room at top, pb-8 at bottom
        */}
        <div className="px-4 md:px-6 pt-20 md:pt-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
