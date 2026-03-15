'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, BarChart3, AlertCircle } from 'lucide-react';
import type { Client } from '@/types/database';

const LOADING_MESSAGES = [
  'Connecting to Google Analytics…',
  'Analyzing your data…',
  'Generating insights…',
  'Almost ready…',
];

const MESSAGE_INTERVALS_MS = [0, 3000, 6000, 10000];

interface Props {
  client: Client;
}

export default function GenerateReportForm({ client }: Props) {
  const router = useRouter();

  // Default period: first and last day of the previous month
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastOfPrevMonth = new Date(firstOfThisMonth.getTime() - 1);
    const firstOfPrevMonth = new Date(lastOfPrevMonth.getFullYear(), lastOfPrevMonth.getMonth(), 1);

    setPeriodStart(firstOfPrevMonth.toISOString().split('T')[0]);
    setPeriodEnd(lastOfPrevMonth.toISOString().split('T')[0]);
  }, []);

  // Cycle through loading messages on a schedule
  const startMessageCycle = useCallback(() => {
    MESSAGE_INTERVALS_MS.forEach((delay, i) => {
      if (i === 0) return;
      setTimeout(() => setLoadingMessageIndex(i), delay);
    });
  }, []);

  async function handleGenerate() {
    setError(null);
    setIsGenerating(true);
    setLoadingMessageIndex(0);
    startMessageCycle();

    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          periodStart,
          periodEnd,
        }),
      });

      const json = await res.json() as { report?: { id: string }; error?: string };

      if (!res.ok || !json.report) {
        throw new Error(json.error ?? 'Failed to generate report');
      }

      router.push(`/reports/${json.report.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsGenerating(false);
      setLoadingMessageIndex(0);
    }
  }

  const periodLabel = (() => {
    if (!periodStart || !periodEnd) return '';
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `${fmt(periodStart)} – ${fmt(periodEnd)}`;
  })();

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Generating your report…</h2>
        <p className="text-base text-slate-500 transition-all duration-500">
          {LOADING_MESSAGES[loadingMessageIndex]}
        </p>
        <p className="text-sm text-slate-400 mt-4">This usually takes 10–20 seconds.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-6">
        {/* Client info */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Generating report for</p>
            <p className="text-base font-semibold text-slate-800">{client.name}</p>
          </div>
        </div>

        {/* Period selector */}
        <div>
          <p className="text-base font-medium text-slate-700 mb-3">Report Period</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="period-start" className="block text-sm text-slate-500 mb-1">
                Start date
              </label>
              <input
                id="period-start"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="period-end" className="block text-sm text-slate-500 mb-1">
                End date
              </label>
              <input
                id="period-end"
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          {periodLabel && (
            <p className="text-sm text-slate-400 mt-2">{periodLabel}</p>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleGenerate}
            disabled={!periodStart || !periodEnd}
            className="bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-5 py-2.5 text-base font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Generate Report
          </button>
          <button
            onClick={() => router.back()}
            className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg px-5 py-2.5 text-base font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
