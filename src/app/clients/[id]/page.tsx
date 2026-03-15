import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ExternalLink, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import DeleteClientButton from './DeleteClientButton';
import ConnectPropertyButton from './ConnectPropertyButton';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [{ data: client, error }, { data: integration }] = await Promise.all([
    supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .maybeSingle(),
  ]);

  if (error) notFound();
  if (!client) notFound();

  const isGoogleConnected = !!integration;

  return (
    <div className="max-w-2xl">
      {/* Back link */}
      <Link
        href="/clients"
        className="text-base text-slate-500 hover:text-slate-700 transition-colors"
      >
        ← Back to Clients
      </Link>

      {/* Client header */}
      <div className="mt-4 mb-8">
        <h1 className="text-xl font-bold text-slate-800 md:text-2xl">{client.name}</h1>
        {client.website_url ? (
          <a
            href={client.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-base text-blue-500 hover:text-blue-600 mt-1.5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {client.website_url.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          <p className="text-base text-slate-400 mt-1.5">No website</p>
        )}
      </div>

      {/* Details card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Details
        </h2>
        <dl className="space-y-4">
          <div className="flex justify-between items-center text-base">
            <dt className="text-slate-500">GA4 Property</dt>
            <dd>
              <ConnectPropertyButton
                clientId={client.id}
                currentPropertyId={client.ga4_property_id}
                isGoogleConnected={isGoogleConnected}
              />
            </dd>
          </div>
          <div className="flex justify-between text-base">
            <dt className="text-slate-500">Reporting since</dt>
            <dd className="text-slate-800">
              {client.start_date ? formatDate(client.start_date) : '—'}
            </dd>
          </div>
          <div className="flex justify-between text-base">
            <dt className="text-slate-500">Added on</dt>
            <dd className="text-slate-800">{formatDate(client.created_at)}</dd>
          </div>
        </dl>
      </div>

      {/* Reports section */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Reports
          </h2>
          <button
            disabled
            title="Connect Google Analytics first"
            className="bg-blue-500 text-white rounded-lg px-5 py-2.5 text-base font-medium opacity-50 cursor-not-allowed"
          >
            Generate Report
          </button>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="w-14 h-14 text-slate-300 mb-4" />
          <p className="text-base font-medium text-slate-700">No reports yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Connect Google Analytics to generate your first report.
          </p>
        </div>
      </div>

      {/* Danger zone */}
      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <h2 className="text-base font-semibold text-red-700 mb-1">Danger Zone</h2>
        <p className="text-base text-slate-500 mb-4">
          Permanently delete this client and all associated reports. This cannot be undone.
        </p>
        <DeleteClientButton clientId={client.id} clientName={client.name} />
      </div>
    </div>
  );
}
