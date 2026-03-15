'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Inline markdown renderer — handles ## headings, - bullets, **bold**
// ---------------------------------------------------------------------------

function renderBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-slate-800">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

function NarrativeRenderer({ text }: { text: string }) {
  const rawSections = text.split(/\n(?=## )/);

  return (
    <div className="space-y-5">
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
          } else if (trimmed.includes('•')) {
            // Handle "• item" per line OR "• Item1 • Item2 • Item3" on one line
            const parts = trimmed.split(/•\s*/).map((s) => s.trim()).filter(Boolean);
            bullets.push(...parts);
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
                {paragraphLines.map((line, i) => (
                  <span key={i}>{renderBold(line)}{i < paragraphLines.length - 1 ? ' ' : ''}</span>
                ))}
              </p>
            )}
            {bullets.length > 0 && (
              <ul className="space-y-1.5 mt-2">
                {bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2 text-base text-slate-700">
                    <span className="text-blue-400 mt-1 shrink-0">•</span>
                    <span>{renderBold(bullet)}</span>
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
// Main component
// ---------------------------------------------------------------------------

interface Props {
  reportId: string;
  narrative: string;
}

export default function ReportNarrativeSection({ reportId, narrative }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(narrative);
  const [isSaving, setIsSaving] = useState(false);

  function handleEdit() {
    setDraft(narrative);
    setIsEditing(true);
  }

  function handleCancel() {
    setDraft(narrative);
    setIsEditing(false);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ai_narrative: draft }),
      });

      const json = await res.json() as { error?: string };

      if (!res.ok) {
        throw new Error(json.error ?? 'Failed to save');
      }

      toast.success('Narrative saved.');
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          AI Analysis
        </h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={18}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
          />
          <p className="text-xs text-slate-400">
            Use <code className="bg-slate-100 px-1 rounded">## Heading</code> for sections and{' '}
            <code className="bg-slate-100 px-1 rounded">- item</code> for bullets.{' '}
            <code className="bg-slate-100 px-1 rounded">**bold**</code> for emphasis.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={isSaving || !draft.trim()}
              className="bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving…
                </span>
              ) : (
                'Save'
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <NarrativeRenderer text={narrative} />
      )}
    </div>
  );
}
