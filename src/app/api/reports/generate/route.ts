import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getValidAccessToken, getGA4Data } from '@/lib/google-analytics';
import { getMockGA4Data, getMockPreviousData, MOCK_PROPERTY_IDS } from '@/lib/mock-analytics';
import { generateReportNarrative } from '@/lib/anthropic';

const bodySchema = z.object({
  clientId: z.string().uuid('clientId must be a UUID'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'periodStart must be YYYY-MM-DD'),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'periodEnd must be YYYY-MM-DD'),
});

/** Returns the same-length period immediately before the given range. */
function getPreviousPeriod(start: string, end: string): { start: string; end: string } {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const daysDiff = Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const prevEnd = new Date(startDate);
  prevEnd.setDate(prevEnd.getDate() - 1);

  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - daysDiff);

  return {
    start: prevStart.toISOString().split('T')[0],
    end: prevEnd.toISOString().split('T')[0],
  };
}

function formatPeriodLabel(start: string, end: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse + validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { clientId, periodStart, periodEnd } = parsed.data;

  // -----------------------------------------------------------------------
  // Paywall check — free users are limited to 1 report total
  // -----------------------------------------------------------------------
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  if (profile?.plan !== 'pro') {
    // Count all reports across all of this user's clients
    const { data: userClients } = await adminSupabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id);

    const clientIds = (userClients ?? []).map((c) => c.id);

    if (clientIds.length > 0) {
      const { count } = await adminSupabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .in('client_id', clientIds);

      if ((count ?? 0) >= 1) {
        return NextResponse.json(
          { error: 'Upgrade to Pro to generate more reports', code: 'PAYWALL' },
          { status: 403 }
        );
      }
    }
  }

  // Verify the client belongs to this user and has a GA4 property
  const { data: client, error: clientError } = await adminSupabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('user_id', user.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  if (!client.ga4_property_id) {
    return NextResponse.json(
      { error: 'Client has no GA4 property connected. Please connect one first.' },
      { status: 422 }
    );
  }

  const propertyId = client.ga4_property_id;
  const prev = getPreviousPeriod(periodStart, periodEnd);

  // -----------------------------------------------------------------------
  // Fetch GA4 data — mock if it's a demo property or real API fails
  // -----------------------------------------------------------------------
  let currentData, previousData;

  if (MOCK_PROPERTY_IDS.includes(propertyId)) {
    console.log('Using mock GA4 data for report generation (mock property)');
    currentData = getMockGA4Data(propertyId, periodStart, periodEnd);
    previousData = getMockPreviousData(propertyId, prev.start, prev.end);
  } else {
    try {
      const accessToken = await getValidAccessToken(user.id);
      [currentData, previousData] = await Promise.all([
        getGA4Data(accessToken, propertyId, periodStart, periodEnd),
        getGA4Data(accessToken, propertyId, prev.start, prev.end),
      ]);
    } catch (err) {
      console.error('GA4 API error, falling back to mock:', err instanceof Error ? err.message : err);
      console.log('Using mock GA4 data for report generation (API unavailable)');
      currentData = getMockGA4Data(propertyId, periodStart, periodEnd);
      previousData = getMockPreviousData(propertyId, prev.start, prev.end);
    }
  }

  // Optionally fetch baseline from client.start_date
  let baselineData = undefined;
  if (client.start_date && !MOCK_PROPERTY_IDS.includes(propertyId)) {
    try {
      const accessToken = await getValidAccessToken(user.id);
      // Baseline: same date range length starting from client.start_date
      const startDate = new Date(client.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);
      baselineData = await getGA4Data(
        accessToken,
        propertyId,
        client.start_date,
        endDate.toISOString().split('T')[0]
      );
    } catch {
      // Baseline is optional — skip silently
    }
  }

  // -----------------------------------------------------------------------
  // Generate AI narrative
  // -----------------------------------------------------------------------
  let aiNarrative: string;
  try {
    aiNarrative = await generateReportNarrative(
      { current: currentData, previous: previousData, baseline: baselineData },
      client.name,
      client.website_url ?? client.name,
      formatPeriodLabel(periodStart, periodEnd),
      formatPeriodLabel(prev.start, prev.end),
    );
  } catch (err) {
    console.error('Claude API error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Failed to generate AI narrative. Please try again.' },
      { status: 500 }
    );
  }

  // -----------------------------------------------------------------------
  // Save report to Supabase
  // -----------------------------------------------------------------------
  const { data: report, error: insertError } = await adminSupabase
    .from('reports')
    .insert({
      client_id: clientId,
      period_start: periodStart,
      period_end: periodEnd,
      data_snapshot: currentData,
      previous_data_snapshot: previousData,
      ai_narrative: aiNarrative,
      status: 'draft',
    })
    .select()
    .single();

  if (insertError || !report) {
    console.error('Failed to save report:', insertError?.message);
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
  }

  return NextResponse.json({ report }, { status: 201 });
}
