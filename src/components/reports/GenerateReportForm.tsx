'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, BarChart3, AlertCircle, ArrowRight } from 'lucide-react';
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
  const [isPaywalled, setIsPaywalled] = useState(false);

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

      const json = await res.json() as { report?: { id: string }; error?: string; code?: string };

      if (res.status === 403 && json.code === 'PAYWALL') {
        setIsPaywalled(true);
        setIsGenerating(false);
        setLoadingMessageIndex(0);
        return;
      }

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

  if (isPaywalled) {
    return (
      <div className="max-w-lg">
        <div className="bg-white border border-orange-200 rounded-lg shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">Free plan limit reached</h2>
          <p className="text-sm text-stone-500 mb-6">
            You&apos;ve used your 1 free report. Upgrade to Pro to generate unlimited reports for all your clients.
          </p>
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-6 text-left space-y-2">
            <p className="text-sm font-medium text-stone-700">Pro plan includes:</p>
            <ul className="text-sm text-stone-500 space-y-1">
              <li>✓ Unlimited reports</li>
              <li>✓ Up to 10 clients</li>
              <li>✓ Full AI narratives &amp; PDF export</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/settings"
              className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-5 py-2.5 text-base font-medium transition-colors"
            >
              Upgrade to Pro
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => router.back()}
              className="text-sm text-stone-500 hover:text-stone-700 transition-colors py-1"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-6">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
        <h2 className="text-2xl font-semibold text-stone-800 mb-2 tracking-tight">Generating your report…</h2>
        <p className="text-lg text-stone-500 transition-all duration-500">
          {LOADING_MESSAGES[loadingMessageIndex]}
        </p>
        <p className="text-sm text-stone-400 mt-4">This usually takes 10–20 seconds.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-8 space-y-6">
        {/* Client info */}
        <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-stone-500">Generating report for</p>
            <p className="text-base font-semibold text-stone-800">{client.name}</p>
          </div>
        </div>

        {/* Period selector */}
        <div>
          <p className="text-base font-medium text-stone-700 mb-3">Report Period</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="period-start" className="block text-sm text-stone-500 mb-1">
                Start date
              </label>
              <input
                id="period-start"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="period-end" className="block text-sm text-stone-500 mb-1">
                End date
              </label>
              <input
                id="period-end"
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
          {periodLabel && (
            <p className="text-sm text-stone-400 mt-2">{periodLabel}</p>
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
            className="bg-orange-600 text-white hover:bg-orange-700 rounded-lg px-6 py-3 text-base font-medium transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Generate Report
          </button>
          <button
            onClick={() => router.back()}
            className="bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 rounded-lg px-5 py-2.5 text-base font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
