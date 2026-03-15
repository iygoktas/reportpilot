import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BarChart3, Plus, ExternalLink, Users, FileText, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Client, Report } from '@/types/database';

function getFirstName(fullName: string): string {
  return fullName.trim().split(' ')[0];
}

function formatReportDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [profileResult, clientsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const profile = profileResult.data;
  const clients: Client[] = clientsResult.data ?? [];

  const latestReportsByClient = new Map<string, Report>();
  let totalReports = 0;

  if (clients.length > 0) {
    const { data: reports } = await supabase
      .from('reports')
      .select('*')
      .in('client_id', clients.map((c) => c.id))
      .order('created_at', { ascending: false });

    totalReports = reports?.length ?? 0;

    for (const report of reports ?? []) {
      if (!latestReportsByClient.has(report.client_id)) {
        latestReportsByClient.set(report.client_id, report);
      }
    }
  }

  const metadata = user.user_metadata as { full_name?: string };
  const displayName =
    profile?.full_name || metadata.full_name || user.email?.split('@')[0] || 'there';

  const firstName = getFirstName(displayName);
  const plan: 'free' | 'pro' = profile?.plan === 'pro' ? 'pro' : 'free';
  const clientCount = clients.length;
  const ga4ConnectedCount = clients.filter((c) => c.ga4_property_id).length;

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-stone-800 tracking-tight">
            Hi {firstName}
          </h1>
          <p className="text-lg text-stone-500 mt-1">
            {clientCount === 0
              ? 'Get started by adding your first client.'
              : `Here's an overview of your workspace.`}
          </p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center justify-center gap-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg px-5 py-2.5 text-base font-medium transition-colors sm:shrink-0"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Clients */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 flex items-center gap-3 overflow-hidden">
          <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl md:text-4xl font-semibold text-stone-800 tracking-tight">{clientCount}</p>
            <p className="text-xs md:text-base text-stone-500 mt-0.5 truncate">Total Clients</p>
          </div>
        </div>

        {/* Total Reports */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 flex items-center gap-3 overflow-hidden">
          <div className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-teal-600" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl md:text-4xl font-semibold text-stone-800 tracking-tight">{totalReports}</p>
            <p className="text-xs md:text-base text-stone-500 mt-0.5">
              <span className="md:hidden">Reports</span>
              <span className="hidden md:inline">Reports Generated</span>
            </p>
          </div>
        </div>

        {/* GA4 Connected */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 flex items-center gap-3 overflow-hidden">
          <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl md:text-4xl font-semibold text-stone-800 tracking-tight">{ga4ConnectedCount}</p>
            <p className="text-xs md:text-base text-stone-500 mt-0.5">
              <span className="md:hidden">GA4</span>
              <span className="hidden md:inline">GA4 Connected</span>
            </p>
          </div>
        </div>

        {/* Current Plan */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 flex items-center gap-3 overflow-hidden">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${plan === 'pro' ? 'bg-orange-100' : 'bg-stone-100'}`}>
            <Zap className={`w-5 h-5 ${plan === 'pro' ? 'text-orange-600' : 'text-stone-400'}`} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl md:text-4xl font-semibold text-stone-800 tracking-tight">{plan === 'pro' ? 'Pro' : 'Free'}</p>
            <p className="text-sm text-stone-500 mt-0.5">
              {plan === 'pro' ? (
                'Current plan'
              ) : (
                <Link href="/settings" className="text-orange-600 hover:text-orange-700 transition-colors">
                  Upgrade →
                </Link>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Clients section */}
      {clientCount > 0 && (
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            Your Clients
            <span className="ml-2 text-sm font-normal text-stone-400">{clientCount} total</span>
          </h2>
        </div>
      )}

      {/* Empty state */}
      {clientCount === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-5">
            <BarChart3 className="w-10 h-10 text-orange-400" />
          </div>
          <h2 className="text-2xl font-semibold text-stone-700 mb-2 tracking-tight">No clients yet</h2>
          <p className="text-lg text-stone-500 mb-6">
            Add your first client to start generating reports
          </p>
          <Link
            href="/clients/new"
            className="bg-orange-600 text-white hover:bg-orange-700 rounded-lg px-5 py-2.5 text-base font-medium transition-colors"
          >
            Add Client
          </Link>
        </div>
      )}

      {/* Client cards grid */}
      {clientCount > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {clients.map((client) => {
            const latestReport = latestReportsByClient.get(client.id);
            const canGenerate = !!client.ga4_property_id;
            return (
              <div
                key={client.id}
                className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 flex flex-col gap-5 hover:shadow-md hover:border-orange-200 transition-all duration-200"
              >
                {/* Top: name + website */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-xl font-semibold text-stone-800 hover:text-orange-600 transition-colors"
                    >
                      {client.name}
                    </Link>
                    {client.website_url ? (
                      <a
                        href={client.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 mt-1 w-fit transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        {client.website_url.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <p className="text-sm text-stone-400 mt-1">No website</p>
                    )}
                  </div>

                  {/* GA4 badge */}
                  <div className="shrink-0">
                    {canGenerate ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-teal-50 text-teal-600 border border-teal-100 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                        GA4 Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-stone-50 text-stone-500 border border-stone-200 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                        Not connected
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom row: last report + generate button */}
                <div className="pt-3 border-t border-stone-100 mt-auto flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-stone-400 min-w-0">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {latestReport
                        ? `Last report: ${formatReportDate(latestReport.created_at)}`
                        : 'No reports yet'}
                    </span>
                  </div>
                  {canGenerate ? (
                    <Link
                      href={`/reports/generate?client_id=${client.id}`}
                      className="inline-flex items-center gap-1.5 bg-orange-600 text-white hover:bg-orange-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors shrink-0"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      Generate
                    </Link>
                  ) : (
                    <Link
                      href={`/clients/${client.id}`}
                      className="inline-flex items-center gap-1.5 bg-white text-stone-500 border border-stone-200 hover:bg-stone-50 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors shrink-0"
                    >
                      Connect GA4
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
