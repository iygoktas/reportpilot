import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import ReportNarrativeSection from '@/components/reports/ReportNarrativeSection';
import MetricsChart from '@/components/reports/MetricsChart';
import DownloadPDFButton from '@/components/reports/DownloadPDFButton';
import EditNarrativeButton from '@/components/reports/EditNarrativeButton';
import type { GA4Data } from '@/types/analytics';
import type { Json } from '@/types/database';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

function toGA4Data(snapshot: Json): GA4Data | null {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return null;
  const s = snapshot as Record<string, unknown>;
  if (typeof s.sessions !== 'number') return null;
  return s as unknown as GA4Data;
}

// ---------------------------------------------------------------------------
// Metric card
// ---------------------------------------------------------------------------

interface MetricCardProps {
  label: string;
  value: string;
  change: number;
  invertColors?: boolean;
}

function MetricCard({ label, value, change, invertColors = false }: MetricCardProps) {
  const isPositive = invertColors ? change < 0 : change > 0;
  const isNegative = invertColors ? change > 0 : change < 0;

  const cardClass = isPositive
    ? 'bg-teal-50 border-stone-200 border-l-[4px] border-l-teal-600'
    : isNegative
    ? 'bg-red-50/50 border-red-200 border-l-[4px] border-l-red-500'
    : 'bg-stone-50 border-stone-200 border-l-[4px] border-l-stone-300';

  const changeClass = isPositive
    ? 'text-teal-600'
    : isNegative
    ? 'text-red-500'
    : 'text-stone-500';

  const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';

  return (
    <div className={`border rounded-xl p-4 ${cardClass}`}>
      <p className="text-base text-stone-500 mb-1">{label}</p>
      <p className="text-4xl font-semibold text-stone-800 tracking-tight">{value}</p>
      {change !== 0 ? (
        <p className={`text-sm font-medium mt-1 ${changeClass}`}>
          {arrow} {Math.abs(change)}%
        </p>
      ) : (
        <p className="text-sm font-medium mt-1 text-stone-400">→ no change</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ReportViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: report, error: reportError } = await adminSupabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();

  if (reportError || !report) notFound();

  const { data: client, error: clientError } = await adminSupabase
    .from('clients')
    .select('*')
    .eq('id', report.client_id)
    .eq('user_id', user.id)
    .single();

  if (clientError || !client) notFound();

  const current = toGA4Data(report.data_snapshot);
  const previous = toGA4Data(report.previous_data_snapshot ?? null);

  if (!current) notFound();

  const currentLabel = `${formatDateShort(report.period_start)} – ${formatDateShort(report.period_end)}`;
  const prevStart = previous ? report.period_start : null; // approximate — good enough for label
  const previousLabel = prevStart ? 'Previous period' : 'Previous period';

  return (
    <div>
      {/* Back link */}
      <Link
        href={`/clients/${client.id}`}
        className="text-base text-stone-500 hover:text-stone-700 transition-colors"
      >
        ← Back to {client.name}
      </Link>

      {/* Report header */}
      <div className="mt-4 mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800 tracking-tight md:text-3xl">
            Monthly Report: {client.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-base text-stone-500">
              {formatDate(report.period_start)} – {formatDate(report.period_end)}
            </p>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                report.status === 'final'
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-stone-100 text-stone-500'
              }`}
            >
              {report.status === 'final' ? 'Final' : 'Draft'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          {report.ai_narrative && (
            <EditNarrativeButton reportId={report.id} currentNarrative={report.ai_narrative} />
          )}
          <DownloadPDFButton reportId={report.id} />
        </div>
      </div>

      {/* Metric cards — 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        <MetricCard
          label="Sessions"
          value={current.sessions.toLocaleString()}
          change={previous ? pctChange(current.sessions, previous.sessions) : 0}
        />
        <MetricCard
          label="Users"
          value={current.users.toLocaleString()}
          change={previous ? pctChange(current.users, previous.users) : 0}
        />
        <MetricCard
          label="Avg Duration"
          value={formatDuration(current.avgSessionDuration)}
          change={previous ? pctChange(current.avgSessionDuration, previous.avgSessionDuration) : 0}
        />
        <MetricCard
          label="Bounce Rate"
          value={`${current.bounceRate.toFixed(1)}%`}
          change={previous ? pctChange(current.bounceRate, previous.bounceRate) : 0}
          invertColors
        />
      </div>

      {/* Trend chart */}
      <MetricsChart
        current={current}
        previous={previous}
        currentLabel={currentLabel}
        previousLabel={previousLabel}
      />

      {/* AI Narrative — inline editable */}
      {report.ai_narrative && (
        <ReportNarrativeSection
          reportId={report.id}
          narrative={report.ai_narrative}
        />
      )}

      {/* Top pages + traffic sources */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">
            Top Pages
          </h2>
          <ol className="space-y-2">
            {current.topPages.map((page, i) => (
              <li key={i} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-stone-700 truncate">{page.pagePath}</span>
                <span className="text-stone-400 shrink-0 tabular-nums">
                  {page.pageviews.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">
            Traffic Sources
          </h2>
          <ol className="space-y-2">
            {current.trafficSources.map((source, i) => (
              <li key={i} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-stone-700 truncate">{source.sessionSourceMedium}</span>
                <span className="text-stone-400 shrink-0 tabular-nums">
                  {source.sessions.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Back to client */}
      <div className="mt-2">
        <Link
          href={`/clients/${client.id}`}
          className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          ← Back to {client.name}
        </Link>
      </div>
    </div>
  );
}
