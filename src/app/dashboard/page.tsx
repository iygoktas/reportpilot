import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BarChart3, Plus, ExternalLink } from 'lucide-react';
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

  // Fetch profile and clients in parallel
  const [profileResult, clientsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const profile = profileResult.data;
  const clients: Client[] = clientsResult.data ?? [];

  // Fetch the latest report for each client in one query
  const latestReportsByClient = new Map<string, Report>();
  if (clients.length > 0) {
    const { data: reports } = await supabase
      .from('reports')
      .select('*')
      .in(
        'client_id',
        clients.map((c) => c.id)
      )
      .order('created_at', { ascending: false });

    // Keep only the first (newest) report per client
    for (const report of reports ?? []) {
      if (!latestReportsByClient.has(report.client_id)) {
        latestReportsByClient.set(report.client_id, report);
      }
    }
  }

  const metadata = user.user_metadata as {
    full_name?: string;
  };
  const displayName =
    profile?.full_name ||
    metadata.full_name ||
    user.email?.split('@')[0] ||
    'there';

  const firstName = getFirstName(displayName);
  const plan: 'free' | 'pro' = profile?.plan === 'pro' ? 'pro' : 'free';
  const clientCount = clients.length;
  // Pro plan limit shown in DESIGN.md example is 5
  const CLIENT_LIMIT = 5;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Hi {firstName},{' '}
            {clientCount === 0
              ? 'you have no active clients yet'
              : `you have ${clientCount} active client${clientCount === 1 ? '' : 's'}`}
          </p>

          {/* Plan indicator */}
          <div className="mt-2">
            {plan === 'pro' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                Pro Plan — {clientCount}/{CLIENT_LIMIT} clients
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Free Plan —{' '}
                <Link href="/settings" className="underline underline-offset-2 hover:text-slate-700">
                  upgrade for more
                </Link>
              </span>
            )}
          </div>
        </div>

        <Link
          href="/clients/new"
          className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-4 py-2 text-sm font-medium transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </Link>
      </div>

      {/* Empty state */}
      {clientCount === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 mb-4" />
          <h2 className="text-lg font-medium text-slate-700 mb-2">No clients yet</h2>
          <p className="text-sm text-slate-500 mb-6">
            Add your first client to start generating reports
          </p>
          <Link
            href="/clients/new"
            className="bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Add Client
          </Link>
        </div>
      )}

      {/* Client cards grid */}
      {clientCount > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clients.map((client) => {
            const latestReport = latestReportsByClient.get(client.id);
            return (
              <div
                key={client.id}
                className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col gap-4"
              >
                {/* Card top: name + website */}
                <div>
                  <Link
                    href={`/clients/${client.id}`}
                    className="font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                  >
                    {client.name}
                  </Link>

                  {client.website_url ? (
                    <a
                      href={client.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mt-0.5 w-fit transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {client.website_url.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400 mt-0.5">No website</p>
                  )}
                </div>

                {/* GA4 status */}
                <p className="text-sm text-slate-400">
                  GA4:{' '}
                  {client.ga4_property_id ? (
                    <span className="text-green-600 font-medium">Connected</span>
                  ) : (
                    'Not connected'
                  )}
                </p>

                {/* Card bottom: generate button + last report */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                  <button
                    disabled
                    title="Connect Google Analytics to generate reports"
                    className="bg-blue-500 text-white rounded-lg px-3 py-1.5 text-sm font-medium opacity-50 cursor-not-allowed"
                  >
                    Generate Report
                  </button>

                  <span className="text-xs text-slate-400">
                    {latestReport
                      ? `Last report: ${formatReportDate(latestReport.created_at)}`
                      : 'No reports yet'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
