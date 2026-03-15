import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatPeriod(start: string, end: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch all of this user's clients
  const { data: clients } = await adminSupabase
    .from('clients')
    .select('id, name')
    .eq('user_id', user.id);

  const clientIds = (clients ?? []).map((c) => c.id);
  const clientMap = Object.fromEntries((clients ?? []).map((c) => [c.id, c.name]));

  // Fetch all reports for those clients, newest first
  const { data: reports } = clientIds.length > 0
    ? await adminSupabase
        .from('reports')
        .select('id, client_id, period_start, period_end, status, created_at')
        .in('client_id', clientIds)
        .order('created_at', { ascending: false })
    : { data: [] };

  const isEmpty = !reports || reports.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">Reports</h1>
          <p className="text-lg text-slate-500 mt-1">All generated reports across your clients.</p>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5">
            <FileText className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-700 mb-1 tracking-tight">No reports yet</h2>
          <p className="text-lg text-slate-500 mb-6">
            Generate your first report from a client page.
          </p>
          <Link
            href="/clients"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          >
            Go to Clients
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Period
                </th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports!.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-800">
                    {clientMap[report.client_id] ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {formatPeriod(report.period_start, report.period_end)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                        report.status === 'final'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {report.status === 'final' ? 'Final' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {formatDate(report.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/reports/${report.id}`}
                      className="text-blue-500 hover:text-blue-700 font-medium transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
