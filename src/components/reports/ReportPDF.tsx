import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { GA4Data } from '@/types/analytics';

// ---------------------------------------------------------------------------
// A4 Portrait geometry (points): 595.28 w × 841.89 h
//   PAD_TOP    36  PAD_BOTTOM  48  →  usable height = 757 pt
//   PAD_H      44 each side   →  usable width  = 507 pt
//
// PAGE 1 HEIGHT BUDGET (with larger fonts):
//   header           ≈  55 pt  (logo 22pt + paddingBottom 12 + marginBottom 16 + sub)
//   sectionLabel     ≈  16 pt  (8pt text + 8pt margin)
//   metricsGrid      ≈ 160 pt  (2 rows × 67pt card + 8pt gap + 18pt margin)
//   sectionLabel     ≈  16 pt
//   narrativeCard    ≈ 510 pt  (remaining budget)
//   ────────────────────────────────
//   total            ≈ 757 pt  ✓
//
// PAGE 2 HEIGHT BUDGET (5 rows per table):
//   header           ≈  55 pt
//   table 1 block    ≈ 346 pt  (title 22 + hdrRow 39 + 5×53 + card 304 + margin 20)
//   table 2 block    ≈ 346 pt
//   ────────────────────────────────
//   total            ≈ 747 pt  (10 pt breathing room before fixed footer)
// ---------------------------------------------------------------------------

const MAX_TABLE_ROWS = 5;   // hard cap — prevents 3rd-page overflow

const PAD_H      = 44;
const PAD_TOP    = 36;
const PAD_BOTTOM = 48;

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    paddingTop: PAD_TOP,
    paddingBottom: PAD_BOTTOM,
    paddingHorizontal: PAD_H,
    color: '#1c1917',
    fontSize: 11,
  },

  // ── Header ───────────────────────────────────────────────────────────────
  // max(logo 22pt, title 14 + gap 3 + sub 10 = 27pt) = 27pt
  // + paddingBottom 12 + border 2 + marginBottom 16 = 57pt total
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#EA580C',
    marginBottom: 16,
  },
  logoText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: '#EA580C',
  },
  headerRight: { alignItems: 'flex-end' },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: '#1c1917',
  },
  headerSub: { fontSize: 10, color: '#78716c', marginTop: 3 },

  // ── Section label ─────────────────────────────────────────────────────────
  // 8pt text + 8pt marginBottom = 16pt
  sectionLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: '#a8a29e',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  // ── Metric cards (2×2) ───────────────────────────────────────────────────
  // Card height: label(10) + gap(4) + value(20) + gap(3) + change(10) = 47pt
  //   + paddingVertical 10×2 = 20pt → ~67pt per card
  // Grid: 67 + 8gap + 67 + 18marginBottom = 160pt
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    width: '48%',
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metricCardNeutral:  { backgroundColor: '#fafaf9', borderColor: '#e7e5e4', borderLeftColor: '#d6d3d1' },
  metricCardPositive: { backgroundColor: '#f0fdfa', borderColor: '#99f6e4', borderLeftColor: '#0D9488' },
  metricCardNegative: { backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderLeftColor: '#EF4444' },
  metricLabel:     { fontSize: 10, color: '#78716c', marginBottom: 4 },
  metricValue:     { fontFamily: 'Helvetica-Bold', fontSize: 20, color: '#1c1917', marginBottom: 3 },
  metricChangePos: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0D9488' },
  metricChangeNeg: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#EF4444' },
  metricChangeNeu: { fontSize: 10, color: '#a8a29e' },

  // ── Narrative card ───────────────────────────────────────────────────────
  // Available budget: 757 - 57 - 16 - 160 - 16 = 508pt
  // Card padding: 14×2 horizontal, 13 top + 13 bottom = 26pt vertical overhead
  // Content budget: 482pt — comfortably fits a 4-section narrative at 11pt body
  narrativeCard: {
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
  },
  narrativeSec: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  narrativeSecNotFirst: {
    flexDirection: 'column',
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f4',
  },
  narrativeHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: '#EA580C',
    marginBottom: 3,
  },
  narrativeLine: {
    fontSize: 10,
    color: '#44403c',
    lineHeight: 1.4,
    marginBottom: 1,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletDot: {
    fontSize: 10,
    color: '#EA580C',
    marginRight: 6,
    lineHeight: 1.4,
  },
  bulletText: {
    fontSize: 10,
    color: '#44403c',
    lineHeight: 1.4,
    flex: 1,
  },

  // ── Page 2 tables ─────────────────────────────────────────────────────────
  // Per table block (5 rows):
  //   title+margin: 14pt text + 8pt margin = 22pt
  //   header row:   paddingV 13×2 + text 10pt ≈ 39pt
  //   data rows:    5 × (paddingV 20×2 + text ~13pt) ≈ 5 × 53 = 265pt
  //   card total:   39 + 265 = 304pt
  //   + marginBottom 20pt → 346pt per table
  // Two tables: 346×2 + 55pt header = 747pt  ✓  (within 757pt)
  tableTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: '#1c1917',
    marginBottom: 8,
  },
  tableCard: {
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f4',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
  },
  tableHeaderLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#78716c',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  tableHeaderBarSpacer: { width: 100, marginHorizontal: 10 },
  tableHeaderValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#78716c',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    width: 64,
    textAlign: 'right',
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
  },
  tableDataRowOdd:  { backgroundColor: '#fafaf9' },
  tableDataRowLast: { borderBottomWidth: 0 },
  tableDataLabel:   { fontSize: 11, color: '#44403c', flex: 1 },
  barTrack: {
    width: 100,
    height: 10,
    backgroundColor: '#fff1e6',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  barFill: {
    height: 10,
    backgroundColor: '#EA580C',
    borderRadius: 5,
  },
  tableDataValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#78716c',
    width: 64,
    textAlign: 'right',
  },

  // ── Footer (fixed → every page) ──────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 18,
    left: PAD_H,
    right: PAD_H,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
    paddingTop: 7,
  },
  footerText: { fontSize: 8, color: '#a8a29e' },
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
// Narrative section
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
    } else if (t.includes('•')) {
      const parts = t.split(/•\s*/).map((p) => p.trim()).filter(Boolean);
      bullets.push(...parts);
    } else {
      paragraphLines.push(t);
    }
  }

  return (
    <View style={isFirst ? s.narrativeSec : s.narrativeSecNotFirst}>
      {heading !== null && (
        <Text style={s.narrativeHeading}>{heading}</Text>
      )}
      {paragraphLines.map((line, i) => (
        <Text key={`p${i}`} style={s.narrativeLine}>
          {stripBold(line)}
        </Text>
      ))}
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
// Data table (page 2) — capped at MAX_TABLE_ROWS to prevent page overflow
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
  const capped = rows.slice(0, MAX_TABLE_ROWS);
  const maxVal = Math.max(...capped.map((r) => r.value), 1);
  const BAR_WIDTH = 100;

  return (
    <View>
      <Text style={s.tableTitle}>{title}</Text>
      <View style={s.tableCard}>
        <View style={s.tableHeaderRow}>
          <Text style={s.tableHeaderLabel}>{colLabel}</Text>
          <View style={s.tableHeaderBarSpacer} />
          <Text style={s.tableHeaderValue}>{colValue}</Text>
        </View>

        {capped.map((row, i) => {
          const isLast = i === capped.length - 1;
          const isOdd  = i % 2 !== 0;
          const fillW  = Math.max(4, Math.round((row.value / maxVal) * BAR_WIDTH));

          return (
            <View
              key={i}
              style={[
                s.tableDataRow,
                isOdd  ? s.tableDataRowOdd  : {},
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
// Shared header (both pages)
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

  // Slice to MAX_TABLE_ROWS to guarantee 2-page output
  const pageRows: DataRow[] = current.topPages.slice(0, MAX_TABLE_ROWS).map((p) => ({
    label: p.pagePath,
    value: p.pageviews,
  }));

  const srcRows: DataRow[] = current.trafficSources.slice(0, MAX_TABLE_ROWS).map((src) => ({
    label: src.sessionSourceMedium,
    value: src.sessions,
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
