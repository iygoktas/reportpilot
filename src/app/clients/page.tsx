import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Users, ExternalLink, Plus, AlertCircle } from 'lucide-react';
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
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-xl font-medium text-slate-700">Something went wrong</p>
        <p className="text-base text-slate-500 mt-2">{error.message}</p>
        <Link
          href="/clients"
          className="mt-6 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg px-5 py-2.5 text-base font-medium transition-colors"
        >
          Try Again
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Page header — stacks on mobile */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 md:text-2xl">Clients</h1>
          <p className="text-base text-slate-500 mt-1">
            {clients.length === 0
              ? 'No clients yet'
              : `${clients.length} client${clients.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-5 py-2.5 text-base font-medium transition-colors sm:shrink-0"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </Link>
      </div>

      {/* Empty state */}
      {clients.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <Users className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-medium text-slate-700 mb-2">No clients yet</h2>
          <p className="text-base text-slate-500 mb-6">
            Add your first client to start generating reports
          </p>
          <Link
            href="/clients/new"
            className="bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-5 py-2.5 text-base font-medium transition-colors"
          >
            Add Client
          </Link>
        </div>
      )}

      {/* Client cards grid */}
      {clients.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 hover:shadow-md hover:border-slate-300 transition-all block"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-800 truncate">
                    {client.name}
                  </h3>
                  {client.website_url ? (
                    <span className="text-sm text-slate-500 flex items-center gap-1 mt-1 truncate">
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      {client.website_url.replace(/^https?:\/\//, '')}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400 mt-1 block">No website</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-4">
                Added {formatDate(client.created_at)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
