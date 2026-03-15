'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { GA4Data } from '@/types/analytics';

interface Props {
  current: GA4Data;
  previous: GA4Data | null;
  currentLabel: string;
  previousLabel: string;
}

export default function MetricsChart({ current, previous, currentLabel, previousLabel }: Props) {
  const data = [
    {
      name: 'Sessions',
      [currentLabel]: current.sessions,
      [previousLabel]: previous?.sessions ?? 0,
    },
    {
      name: 'Users',
      [currentLabel]: current.users,
      [previousLabel]: previous?.users ?? 0,
    },
    {
      name: 'Pageviews',
      [currentLabel]: current.pageviews,
      [previousLabel]: previous?.pageviews ?? 0,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
        Period Comparison
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
            }
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: 12,
              color: '#1E293B',
            }}
            formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : String(value))}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            formatter={(value) => (
              <span style={{ color: '#64748B' }}>{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey={currentLabel}
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          {previous && (
            <Line
              type="monotone"
              dataKey={previousLabel}
              stroke="#CBD5E1"
              strokeWidth={2}
              dot={{ r: 4, fill: '#CBD5E1', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              strokeDasharray="4 3"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
