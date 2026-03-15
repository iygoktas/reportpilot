'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  reportId: string;
}

export default function DownloadPDFButton({ reportId }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/pdf`);

      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? 'Failed to generate PDF');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Get filename from Content-Disposition header if present
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match ? match[1] : 'ReportPilot_report.pdf';

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PDF downloaded.');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to generate PDF. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-5 py-2.5 text-base font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating PDF…
        </span>
      ) : (
        'Download PDF'
      )}
    </button>
  );
}
