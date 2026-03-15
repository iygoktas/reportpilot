import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ExternalLink, FileText, Calendar, BarChart3, PlusCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Report } from '@/types/database';
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

  const [{ data: client, error }, { data: integration }, { data: reports }] = await Promise.all([
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
    supabase
      .from('reports')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (error) notFound();
  if (!client) notFound();

  const isGoogleConnected = !!integration;
  const canGenerateReport = !!client.ga4_property_id;
  const reportList: Report[] = reports ?? [];

  return (
    <div>
      {/* Back link */}
      <Link
        href="/clients"
        className="text-base text-stone-500 hover:text-stone-700 transition-colors"
      >
        ← Back to Clients
      </Link>

      {/* Client header */}
      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-semibold text-stone-800 tracking-tight">{client.name}</h1>
        {client.website_url ? (
          <a
            href={client.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-base text-orange-600 hover:text-orange-700 mt-1.5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {client.website_url.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          <p className="text-base text-stone-400 mt-1.5">No website</p>
        )}
      </div>

      {/* Details card */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 mb-4">
        <h2 className="text-xl font-semibold text-stone-800 mb-5 tracking-tight">
          Details
        </h2>
        <dl className="space-y-5">
          <div className="flex justify-between items-center">
            <dt className="flex items-center gap-2.5 text-base text-stone-500">
              <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-stone-400" />
              </div>
              GA4 Property
            </dt>
            <dd>
              <ConnectPropertyButton
                clientId={client.id}
                currentPropertyId={client.ga4_property_id}
                isGoogleConnected={isGoogleConnected}
              />
            </dd>
          </div>
          <div className="h-px bg-stone-100" />
          <div className="flex justify-between items-center">
            <dt className="flex items-center gap-2.5 text-base text-stone-500">
              <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-stone-400" />
              </div>
              Reporting since
            </dt>
            <dd className="text-base text-stone-800">
              {client.start_date ? formatDate(client.start_date) : '—'}
            </dd>
          </div>
          <div className="h-px bg-stone-100" />
          <div className="flex justify-between items-center">
            <dt className="flex items-center gap-2.5 text-base text-stone-500">
              <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center">
                <PlusCircle className="w-4 h-4 text-stone-400" />
              </div>
              Added on
            </dt>
            <dd className="text-base text-stone-800">{formatDate(client.created_at)}</dd>
          </div>
        </dl>
      </div>

      {/* Reports section */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-stone-800 tracking-tight">
            Reports
          </h2>
          {canGenerateReport ? (
            <Link
              href={`/reports/generate?client_id=${client.id}`}
              className="bg-orange-600 text-white hover:bg-orange-700 rounded-lg px-5 py-2.5 text-base font-medium transition-colors"
            >
              Generate Report
            </Link>
          ) : (
            <button
              disabled
              title="Connect a GA4 property first"
              className="bg-orange-600 text-white rounded-lg px-5 py-2.5 text-base font-medium opacity-50 cursor-not-allowed"
            >
              Generate Report
            </button>
          )}
        </div>

        {reportList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-base font-medium text-stone-700">No reports yet</p>
            <p className="text-sm text-stone-500 mt-1">
              {canGenerateReport
                ? 'Generate your first report to get started.'
                : 'Connect a GA4 property to generate reports.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {reportList.map((report) => (
              <li key={report.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-medium text-stone-800">
                    {formatDate(report.period_start)} – {formatDate(report.period_end)}
                  </p>
                  <p className="text-sm text-stone-400 mt-0.5">
                    {report.status === 'final' ? 'Final' : 'Draft'} · Created {formatDate(report.created_at)}
                  </p>
                </div>
                <Link
                  href={`/reports/${report.id}`}
                  className="text-base text-orange-600 hover:text-orange-700 transition-colors shrink-0"
                >
                  View →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-stone-200 border-l-4 border-l-red-500 rounded-xl p-6">
        <h2 className="text-base font-semibold text-red-600 mb-1">Danger Zone</h2>
        <p className="text-base text-stone-500 mb-4">
          Permanently delete this client and all associated reports. This cannot be undone.
        </p>
        <DeleteClientButton clientId={client.id} clientName={client.name} />
      </div>
    </div>
  );
}
