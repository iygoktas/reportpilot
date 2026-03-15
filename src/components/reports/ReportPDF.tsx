import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { GA4Data } from '@/types/analytics';

// ---------------------------------------------------------------------------
// A4 page geometry (points)
//   841.89 × 595.28 pt
//   PAD_TOP 36 + PAD_BOTTOM 48  →  usable height ≈ 757 pt
//   PAD_H   44 each side        →  usable width  ≈ 507 pt
//
// PAGE 1 HEIGHT BUDGET:
//   header          ≈  40 pt
//   "Performance"   ≈  15 pt
//   metrics 2×2     ≈ 128 pt  (card 52pt, gap 8, 2 rows, margin 16)
//   "AI Analysis"   ≈  15 pt
//   narrative card  ≈ 559 pt  (remaining)
//   ─────────────────────────
//   total           ≈ 757 pt  ✓
//
// PAGE 2 HEIGHT BUDGET:
//   header           ≈  40 pt
//   table 1 block    ≈ 345 pt  (title 16 + hdr row 30 + 5×57 + margin 14)
//   table 2 block    ≈ 345 pt
//   ─────────────────────────
//   total            ≈ 730 pt  (27 pt breathing room before fixed footer)
// ---------------------------------------------------------------------------

const PAD_H = 44;
const PAD_TOP = 36;
const PAD_BOTTOM = 48;

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    paddingTop: PAD_TOP,
    paddingBottom: PAD_BOTTOM,
    paddingHorizontal: PAD_H,
    color: '#1E293B',
    fontSize: 9,
  },

  // ── Header ───────────────────────────────────────────────────────────────
  // Height: max(logo ~15, rightStack ~21) + paddingBottom 10 + marginBottom 14 = ~40 pt
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 14,
  },
  logoText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: '#3B82F6',
  },
  headerRight: { alignItems: 'flex-end' },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#1E293B',
  },
  headerSub: { fontSize: 8, color: '#64748B', marginTop: 2 },

  // ── Section label ─────────────────────────────────────────────────────────
  // Height: 7 pt text + 8 pt margin = 15 pt
  sectionLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  // ── Metric cards (2×2) ───────────────────────────────────────────────────
  // Card height: paddingV×2(16) + label(8) + gap(3) + value(14) + gap(2) + change(8) = 51 pt
  // Grid: row1(51) + gap(8) + row2(51) + marginBottom(16) = 126 pt
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metricCardNeutral:  { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  metricCardPositive: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  metricCardNegative: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  metricLabel:     { fontSize: 7.5, color: '#64748B', marginBottom: 3 },
  metricValue:     { fontFamily: 'Helvetica-Bold', fontSize: 14, color: '#1E293B', marginBottom: 2 },
  metricChangePos: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#22C55E' },
  metricChangeNeg: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#EF4444' },
  metricChangeNeu: { fontSize: 7.5, color: '#94A3B8' },

  // ── Narrative card ───────────────────────────────────────────────────────
  // Available budget: 757 - 40 - 15 - 126 - 15 = 561 pt
  // Card outer padding top+bottom: 22 pt → content budget: 539 pt
  // Typical 4-section narrative with 8pt/1.4lh text uses ~280–380 pt — well inside.
  narrativeCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 11,
  },

  // Each narrative section — first has no top rule; rest add a thin divider
  narrativeSec: {
    flexDirection: 'column',
    marginBottom: 9,
  },
  narrativeSecNotFirst: {
    flexDirection: 'column',
    marginBottom: 9,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  narrativeHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: '#1E293B',
    marginBottom: 3,
  },
  // Each paragraph line is its own Text so lines never collapse onto one line
  narrativeLine: {
    fontSize: 8,
    color: '#334155',
    lineHeight: 1.4,
    marginBottom: 1,
  },
  // Each bullet is its own View row — guarantees one bullet per line
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletDot: {
    fontSize: 8,
    color: '#3B82F6',
    marginRight: 5,
    lineHeight: 1.4,
  },
  bulletText: {
    fontSize: 8,
    color: '#334155',
    lineHeight: 1.4,
    flex: 1,
  },

  // ── Page 2 tables ─────────────────────────────────────────────────────────
  // Per table block: title(16) + headerRow(30) + 5 × dataRow(57) + marginBottom(14) = 345 pt
  // Two tables: 690 pt + header 40 pt = 730 pt  (within 757 pt)
  tableTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#1E293B',
    marginBottom: 6,
  },
  tableCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 14,
  },
  // Header row height: paddingV×2(22) + text(~8) = 30 pt
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableHeaderLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  tableHeaderBarSpacer: { width: 110, marginHorizontal: 10 },
  tableHeaderValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    width: 58,
    textAlign: 'right',
  },
  // Data row height: paddingV×2(48) + text(~9) = 57 pt
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableDataRowOdd:  { backgroundColor: '#F8FAFC' },
  tableDataRowLast: { borderBottomWidth: 0 },
  tableDataLabel:   { fontSize: 9, color: '#334155', flex: 1 },
  barTrack: {
    width: 110,
    height: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  barFill: {
    height: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 5,
  },
  tableDataValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#64748B',
    width: 58,
    textAlign: 'right',
  },

  // ── Footer (fixed → every page) ──────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 16,
    left: PAD_H,
    right: PAD_H,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 7,
  },
  footerText: { fontSize: 7, color: '#94A3B8' },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Strip **bold** markers for plain PDF text
function stripBold(text: string): string {
  return text.replace(/\*\*/g, '');
}

// ---------------------------------------------------------------------------
// Metric card
// ---------------------------------------------------------------------------

function MetricCard({
  label,
  value,
  change,
  invertColors = false,
}: {
  label: string;
  value: string;
  change: number;
  invertColors?: boolean;
}) {
  const isPos = invertColors ? change < 0 : change > 0;
  const isNeg = invertColors ? change > 0 : change < 0;
  const cardStyle = isPos
    ? [s.metricCard, s.metricCardPositive]
    : isNeg
    ? [s.metricCard, s.metricCardNegative]
    : [s.metricCard, s.metricCardNeutral];
  const changeStyle = isPos ? s.metricChangePos : isNeg ? s.metricChangeNeg : s.metricChangeNeu;
  const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
  const changeText = change !== 0 ? `${arrow} ${Math.abs(change)}%` : '→ no change';

  return (
    <View style={cardStyle}>
      <Text style={s.metricLabel}>{label}</Text>
      <Text style={s.metricValue}>{value}</Text>
      <Text style={changeStyle}>{changeText}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Narrative section — each bullet is its OWN View row, never inline
// ---------------------------------------------------------------------------

function NarrativeSection({
  section,
  isFirst,
}: {
  section: string;
  isFirst: boolean;
}) {
  const lines = section.trim().split('\n');
  const firstLine = lines[0];
  const isHeading = firstLine.startsWith('## ');
  const heading = isHeading ? firstLine.replace(/^## /, '') : null;
  const bodyLines = isHeading ? lines.slice(1) : lines;

  const bullets: string[] = [];
  const paragraphLines: string[] = [];

  for (const line of bodyLines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('- ')) {
      bullets.push(t.slice(2));
    } else {
      paragraphLines.push(t);
    }
  }

  return (
    <View style={isFirst ? s.narrativeSec : s.narrativeSecNotFirst}>
      {heading !== null && (
        <Text style={s.narrativeHeading}>{heading}</Text>
      )}

      {/* Each paragraph line as a separate <Text> so they stack vertically */}
      {paragraphLines.map((line, i) => (
        <Text key={`p${i}`} style={s.narrativeLine}>
          {stripBold(line)}
        </Text>
      ))}

      {/* Each bullet as a separate row View — one bullet per line, guaranteed */}
      {bullets.map((bullet, i) => (
        <View key={`b${i}`} style={s.bulletRow}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>{stripBold(bullet)}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Data table (page 2) — alternating rows + inline proportional bar
// ---------------------------------------------------------------------------

interface DataRow {
  label: string;
  value: number;
}

function DataTable({
  title,
  colLabel,
  colValue,
  rows,
}: {
  title: string;
  colLabel: string;
  colValue: string;
  rows: DataRow[];
}) {
  const maxVal = Math.max(...rows.map((r) => r.value), 1);
  const BAR_WIDTH = 110;

  return (
    <View>
      <Text style={s.tableTitle}>{title}</Text>
      <View style={s.tableCard}>
        {/* Column headers */}
        <View style={s.tableHeaderRow}>
          <Text style={s.tableHeaderLabel}>{colLabel}</Text>
          <View style={s.tableHeaderBarSpacer} />
          <Text style={s.tableHeaderValue}>{colValue}</Text>
        </View>

        {/* Data rows */}
        {rows.map((row, i) => {
          const isLast = i === rows.length - 1;
          const isOdd  = i % 2 !== 0;
          // Minimum 4 pt fill so even small values show a sliver
          const fillW  = Math.max(4, Math.round((row.value / maxVal) * BAR_WIDTH));

          return (
            <View
              key={i}
              style={[
                s.tableDataRow,
                isOdd ? s.tableDataRowOdd : {},
                isLast ? s.tableDataRowLast : {},
              ]}
            >
              <Text style={s.tableDataLabel}>{row.label}</Text>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: fillW }]} />
              </View>
              <Text style={s.tableDataValue}>{row.value.toLocaleString()}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Shared header view (re-used on both pages)
// ---------------------------------------------------------------------------

function ReportHeader({
  clientName,
  periodStart,
  periodEnd,
}: {
  clientName: string;
  periodStart: string;
  periodEnd: string;
}) {
  function fmt(d: string) {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return (
    <View style={s.header}>
      <Text style={s.logoText}>ReportPilot</Text>
      <View style={s.headerRight}>
        <Text style={s.headerTitle}>Monthly Report — {clientName}</Text>
        <Text style={s.headerSub}>
          {fmt(periodStart)} – {fmt(periodEnd)}
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Footer (fixed — appears on every page)
// ---------------------------------------------------------------------------

function Footer({ generatedAt }: { generatedAt: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Generated by ReportPilot</Text>
      <Text style={s.footerText}>{generatedAt}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main document
// ---------------------------------------------------------------------------

export interface ReportPDFProps {
  clientName: string;
  periodStart: string;
  periodEnd: string;
  current: GA4Data;
  previous: GA4Data | null;
  narrative: string | null;
  generatedAt: string;
}

export default function ReportPDF({
  clientName,
  periodStart,
  periodEnd,
  current,
  previous,
  narrative,
  generatedAt,
}: ReportPDFProps) {
  const narrativeSections = narrative
    ? narrative.split(/\n(?=## )/).filter(Boolean)
    : [];

  const pageRows: DataRow[] = current.topPages.map((p) => ({
    label: p.pagePath,
    value: p.pageviews,
  }));

  const srcRows: DataRow[] = current.trafficSources.map((s) => ({
    label: s.sessionSourceMedium,
    value: s.sessions,
  }));

  return (
    <Document>
      {/* ── PAGE 1: Overview + AI Narrative ─────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <ReportHeader
          clientName={clientName}
          periodStart={periodStart}
          periodEnd={periodEnd}
        />

        {/* Metric cards */}
        <Text style={s.sectionLabel}>Performance Overview</Text>
        <View style={s.metricsGrid}>
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
            label="Avg Session Duration"
            value={formatDuration(current.avgSessionDuration)}
            change={
              previous
                ? pctChange(current.avgSessionDuration, previous.avgSessionDuration)
                : 0
            }
          />
          <MetricCard
            label="Bounce Rate"
            value={`${current.bounceRate.toFixed(1)}%`}
            change={previous ? pctChange(current.bounceRate, previous.bounceRate) : 0}
            invertColors
          />
        </View>

        {/* AI Narrative */}
        {narrativeSections.length > 0 && (
          <>
            <Text style={s.sectionLabel}>AI Analysis</Text>
            <View style={s.narrativeCard}>
              {narrativeSections.map((section, i) => (
                <NarrativeSection key={i} section={section} isFirst={i === 0} />
              ))}
            </View>
          </>
        )}

        <Footer generatedAt={generatedAt} />
      </Page>

      {/* ── PAGE 2: Traffic Breakdown ────────────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <ReportHeader
          clientName={clientName}
          periodStart={periodStart}
          periodEnd={periodEnd}
        />

        <DataTable
          title="Top Pages"
          colLabel="Page"
          colValue="Pageviews"
          rows={pageRows}
        />

        <DataTable
          title="Traffic Sources"
          colLabel="Source / Medium"
          colValue="Sessions"
          rows={srcRows}
        />

        <Footer generatedAt={generatedAt} />
      </Page>
    </Document>
  );
}
