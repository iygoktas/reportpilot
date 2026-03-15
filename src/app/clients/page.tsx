import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Users, ExternalLink, Plus, AlertCircle, FileText, BarChart3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function ClientsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-xl font-medium text-stone-700">Something went wrong</p>
        <p className="text-base text-stone-500 mt-2">{error.message}</p>
        <Link
          href="/clients"
          className="mt-6 bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 rounded-lg px-5 py-2.5 text-base font-medium transition-colors"
        >
          Try Again
        </Link>
      </div>
    );
  }

  // Fetch report counts per client
  const reportCountByClient = new Map<string, number>();
  if (clients && clients.length > 0) {
    const { data: reports } = await supabase
      .from('reports')
      .select('client_id')
      .in('client_id', clients.map((c) => c.id));

    for (const r of reports ?? []) {
      reportCountByClient.set(r.client_id, (reportCountByClient.get(r.client_id) ?? 0) + 1);
    }
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-stone-800 tracking-tight">Clients</h1>
          <p className="text-lg text-stone-500 mt-1">
            {clients.length === 0
              ? 'No clients yet'
              : `${clients.length} client${clients.length === 1 ? '' : 's'}`}
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

      {/* Empty state */}
      {clients.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-5">
            <Users className="w-10 h-10 text-orange-400" />
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
      {clients.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {clients.map((client) => {
            const reportCount = reportCountByClient.get(client.id) ?? 0;
            const isConnected = !!client.ga4_property_id;

            return (
              <div
                key={client.id}
                className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 hover:shadow-md hover:border-orange-200 transition-all duration-200 flex flex-col gap-4"
              >
                {/* Top row: name + GA4 badge */}
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
                      <span className="text-sm text-stone-400 mt-1 block">No website</span>
                    )}
                  </div>
                  {isConnected ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-teal-50 text-teal-600 border border-teal-100 px-2.5 py-1 rounded-full shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                      GA4 Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-stone-50 text-stone-500 border border-stone-200 px-2.5 py-1 rounded-full shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                      Not connected
                    </span>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 pt-1 border-t border-stone-100">
                  <div className="flex items-center gap-1.5 text-sm text-stone-400">
                    <FileText className="w-3.5 h-3.5" />
                    {reportCount === 0
                      ? 'No reports'
                      : `${reportCount} report${reportCount === 1 ? '' : 's'}`}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-stone-400">
                    <BarChart3 className="w-3.5 h-3.5" />
                    {isConnected ? 'GA4 ready' : 'Connect GA4'}
                  </div>
                  <span className="ml-auto text-xs text-stone-300">
                    Added {formatDate(client.created_at)}
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
