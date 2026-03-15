'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Loader2,
  FileText,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Pencil,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

function renderBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-stone-800">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

function extractBullets(lines: string[]): string[] {
  const bullets: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('- ')) {
      bullets.push(trimmed.slice(2));
    } else if (trimmed.includes('•')) {
      const parts = trimmed.split(/•\s*/).map((s) => s.trim()).filter(Boolean);
      bullets.push(...parts);
    } else if (/^\d+\.\s/.test(trimmed)) {
      bullets.push(trimmed.replace(/^\d+\.\s/, ''));
    }
  }
  return bullets;
}

function extractParagraphs(lines: string[]): string[] {
  return lines
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('- ') && !l.includes('•') && !/^\d+\.\s/.test(l));
}

interface ParsedSection {
  heading: string;
  bullets: string[];
  paragraphs: string[];
}

const SECTION_KEYS = ['Executive Summary', 'Key Wins', 'Areas of Attention', 'Recommendations'];

function parseNarrative(text: string): Record<string, ParsedSection> {
  const result: Record<string, ParsedSection> = {};

  // Remove raw title line (# Title)
  const withoutTitle = text.replace(/^#\s[^\n]*\n?/, '');

  // Split on ## headings
  const rawSections = withoutTitle.split(/\n(?=## )/);

  for (const section of rawSections) {
    const lines = section.trim().split('\n');
    const firstLine = lines[0].trim();
    if (!firstLine.startsWith('## ')) continue;

    const heading = firstLine.replace(/^##\s+/, '');
    const bodyLines = lines.slice(1);

    const matched = SECTION_KEYS.find((k) => heading.toLowerCase().includes(k.toLowerCase()));
    if (!matched) continue;

    result[matched] = {
      heading: matched,
      bullets: extractBullets(bodyLines),
      paragraphs: extractParagraphs(bodyLines),
    };
  }

  return result;
}

// ---------------------------------------------------------------------------
// Section cards
// ---------------------------------------------------------------------------

function ExecutiveSummaryCard({ section }: { section: ParsedSection }) {
  const text = [...section.paragraphs, ...section.bullets].join(' ');
  return (
    <div className="bg-stone-50 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-stone-400 shrink-0" />
        <h3 className="text-sm font-semibold text-stone-600 uppercase tracking-wider">
          Executive Summary
        </h3>
      </div>
      <p className="text-base text-stone-700 leading-relaxed">{renderBold(text)}</p>
    </div>
  );
}

function KeyWinsCard({ section }: { section: ParsedSection }) {
  const items = section.bullets.length > 0 ? section.bullets : section.paragraphs;
  return (
    <div className="bg-teal-50/50 rounded-xl p-6 shadow-sm border-l-4 border-teal-600">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-teal-600 shrink-0" />
        <h3 className="text-sm font-semibold text-teal-700 uppercase tracking-wider">Key Wins</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-base text-stone-700">
            <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
            <span className="leading-relaxed">{renderBold(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AreasOfAttentionCard({ section }: { section: ParsedSection }) {
  const items = section.bullets.length > 0 ? section.bullets : section.paragraphs;
  return (
    <div className="bg-amber-50/50 rounded-xl p-6 shadow-sm border-l-4 border-amber-500">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider">
          Areas of Attention
        </h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-base text-stone-700">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <span className="leading-relaxed">{renderBold(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecommendationsCard({ section }: { section: ParsedSection }) {
  const items = section.bullets.length > 0 ? section.bullets : section.paragraphs;
  return (
    <div className="bg-orange-50/50 rounded-xl p-6 shadow-sm border-l-4 border-orange-600">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-orange-600 shrink-0" />
        <h3 className="text-sm font-semibold text-orange-700 uppercase tracking-wider">
          Recommendations
        </h3>
      </div>
      <ol className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-base text-stone-700">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-600 text-white text-xs font-semibold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span className="leading-relaxed">{renderBold(item)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Narrative renderer
// ---------------------------------------------------------------------------

function NarrativeCards({ text }: { text: string }) {
  const sections = parseNarrative(text);

  return (
    <div className="flex flex-col gap-5">
      {sections['Executive Summary'] && (
        <ExecutiveSummaryCard section={sections['Executive Summary']} />
      )}
      {sections['Key Wins'] && <KeyWinsCard section={sections['Key Wins']} />}
      {sections['Areas of Attention'] && (
        <AreasOfAttentionCard section={sections['Areas of Attention']} />
      )}
      {sections['Recommendations'] && (
        <RecommendationsCard section={sections['Recommendations']} />
      )}
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
    <div className="mb-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-stone-800">AI Analysis</h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Narrative
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={18}
            className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-y"
          />
          <p className="text-xs text-stone-400">
            Use <code className="bg-stone-100 px-1 rounded">## Heading</code> for sections and{' '}
            <code className="bg-stone-100 px-1 rounded">- item</code> for bullets.{' '}
            <code className="bg-stone-100 px-1 rounded">**bold**</code> for emphasis.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={isSaving || !draft.trim()}
              className="bg-orange-600 text-white hover:bg-orange-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
              className="bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <NarrativeCards text={narrative} />
      )}
    </div>
  );
}
