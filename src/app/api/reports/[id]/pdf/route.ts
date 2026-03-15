import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import ReportPDF from '@/components/reports/ReportPDF';
import type { GA4Data } from '@/types/analytics';
import type { Json } from '@/types/database';

function toGA4Data(snapshot: Json): GA4Data | null {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot))
    return null;
  const s = snapshot as Record<string, unknown>;
  if (typeof s.sessions !== 'number') return null;
  return s as unknown as GA4Data;
}

function slugify(str: string): string {
  return str.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: report, error: reportError } = await adminSupabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();

  if (reportError || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  const { data: client, error: clientError } = await adminSupabase
    .from('clients')
    .select('*')
    .eq('id', report.client_id)
    .eq('user_id', user.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const current = toGA4Data(report.data_snapshot);
  if (!current) {
    return NextResponse.json({ error: 'Invalid report data' }, { status: 500 });
  }

  const previous = toGA4Data(report.previous_data_snapshot ?? null);

  const generatedAt = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  let pdfBuffer: Buffer;
  try {
    const element = React.createElement(ReportPDF, {
      clientName: client.name,
      periodStart: report.period_start,
      periodEnd: report.period_end,
      current,
      previous,
      narrative: report.ai_narrative ?? null,
      generatedAt,
    }) as ReactElement<DocumentProps>;
    pdfBuffer = await renderToBuffer(element);
  } catch (err) {
    console.error('PDF generation failed:', err);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }

  const clientSlug = slugify(client.name);
  const periodSlug = `${report.period_start}_${report.period_end}`;
  const filename = `ReportPilot_${clientSlug}_${periodSlug}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdfBuffer.length),
    },
  });
}
