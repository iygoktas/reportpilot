import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** Safely cast Supabase Json blob to GA4Data. */
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
  invertColors?: boolean; // for bounce rate: lower = better
}

function MetricCard({ label, value, change, invertColors = false }: MetricCardProps) {
  const isPositive = invertColors ? change < 0 : change > 0;
  const isNegative = invertColors ? change > 0 : change < 0;

  const cardClass = isPositive
    ? 'bg-green-50 border-green-200'
    : isNegative
    ? 'bg-red-50 border-red-200'
    : 'bg-white border-slate-200';

  const changeClass = isPositive
    ? 'text-green-500'
    : isNegative
    ? 'text-red-500'
    : 'text-slate-500';

  const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
  const absChange = Math.abs(change);

  return (
    <div className={`border rounded-lg p-4 ${cardClass}`}>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      {change !== 0 ? (
        <p className={`text-sm font-medium mt-1 ${changeClass}`}>
          {arrow} {absChange}%
        </p>
      ) : (
        <p className="text-sm font-medium mt-1 text-slate-400">→ no change</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Narrative renderer — parses ## headings and - bullets, no external libs
// ---------------------------------------------------------------------------

function NarrativeSection({ text }: { text: string }) {
  // Split into sections by ## headings
  const rawSections = text.split(/\n(?=## )/);

  return (
    <div className="space-y-6">
      {rawSections.map((section, idx) => {
        const lines = section.trim().split('\n');
        const firstLine = lines[0];
        const isHeading = firstLine.startsWith('## ');
        const heading = isHeading ? firstLine.replace('## ', '') : null;
        const bodyLines = isHeading ? lines.slice(1) : lines;

        const bullets: string[] = [];
        const paragraphLines: string[] = [];

        for (const line of bodyLines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.startsWith('- ')) {
            bullets.push(trimmed.slice(2));
          } else {
            paragraphLines.push(trimmed);
          }
        }

        return (
          <div key={idx}>
            {heading && (
              <h3 className="text-base font-semibold text-slate-800 mb-2">{heading}</h3>
            )}
            {paragraphLines.length > 0 && (
              <p className="text-base text-slate-700 leading-relaxed">
                {paragraphLines.join(' ')}
              </p>
            )}
            {bullets.length > 0 && (
              <ul className="space-y-1.5 mt-2">
                {bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2 text-base text-slate-700">
                    <span className="text-blue-400 mt-1 shrink-0">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
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

  // Fetch report via admin client (bypasses RLS on reports → clients join)
  const { data: report, error: reportError } = await adminSupabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();

  if (reportError || !report) notFound();

  // Verify the client belongs to this user
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

  return (
    <div className="max-w-3xl">
      {/* Back link */}
      <Link
        href={`/clients/${client.id}`}
        className="text-base text-slate-500 hover:text-slate-700 transition-colors"
      >
        ← Back to {client.name}
      </Link>

      {/* Report header */}
      <div className="mt-4 mb-8 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 md:text-2xl">
            Monthly Report: {client.name}
          </h1>
          <p className="text-base text-slate-500 mt-1">
            {formatDate(report.period_start)} – {formatDate(report.period_end)}
          </p>
        </div>
        <span
          className={`self-start text-xs font-medium px-2.5 py-1 rounded-full ${
            report.status === 'final'
              ? 'bg-green-100 text-green-700'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {report.status === 'final' ? 'Final' : 'Draft'}
        </span>
      </div>

      {/* Metric cards */}
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

      {/* AI Narrative */}
      {report.ai_narrative && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
            AI Analysis
          </h2>
          <NarrativeSection text={report.ai_narrative} />
        </div>
      )}

      {/* Top pages + traffic sources */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Top Pages
          </h2>
          <ol className="space-y-2">
            {current.topPages.map((page, i) => (
              <li key={i} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-700 truncate">{page.pagePath}</span>
                <span className="text-slate-400 shrink-0 tabular-nums">
                  {page.pageviews.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Traffic Sources
          </h2>
          <ol className="space-y-2">
            {current.trafficSources.map((source, i) => (
              <li key={i} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-700 truncate">{source.sessionSourceMedium}</span>
                <span className="text-slate-400 shrink-0 tabular-nums">
                  {source.sessions.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          disabled
          title="PDF export coming soon"
          className="bg-blue-500 text-white rounded-lg px-5 py-2.5 text-base font-medium opacity-50 cursor-not-allowed"
        >
          Download PDF
        </button>
        {report.ai_narrative && (
          <EditNarrativeButton reportId={report.id} currentNarrative={report.ai_narrative} />
        )}
        <Link
          href={`/clients/${client.id}`}
          className="text-base text-slate-500 hover:text-slate-700 transition-colors px-2"
        >
          ← Back to Client
        </Link>
      </div>
    </div>
  );
}
