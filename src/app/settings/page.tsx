import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import SettingsClient from '@/components/settings/SettingsClient';
import { Skeleton } from '@/components/ui/skeleton';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [profileResult, integrationResult, clientCountResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('integrations')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .maybeSingle(),
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ]);

  const profile = profileResult.data;
  const integration = integrationResult.data;
  const clientCount = clientCountResult.count ?? 0;

  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ?? null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account, integrations, and billing.</p>
      </div>
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsClient
          isGoogleConnected={!!integration}
          connectedAt={integration?.created_at ?? null}
          plan={profile?.plan ?? 'free'}
          clientCount={clientCount}
          fullName={profile?.full_name ?? null}
          email={profile?.email ?? user.email ?? ''}
          avatarUrl={avatarUrl}
        />
      </Suspense>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <Skeleton className="h-5 w-24 mb-4" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}
