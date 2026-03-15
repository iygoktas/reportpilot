import { createClient } from '@/lib/supabase/server';
import type { GA4Data, GA4Property } from '@/types/analytics';

// ---------------------------------------------------------------------------
// Token management
// ---------------------------------------------------------------------------

/**
 * Returns a valid Google access token for the user.
 * If the stored token is expired (or within 60 s of expiry) it is silently
 * refreshed, the new token is persisted to Supabase, and the fresh value is
 * returned. Throws if no integration exists or the refresh fails.
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const supabase = await createClient();

  const { data: integration, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single();

  if (error || !integration) {
    throw new Error('Google Analytics is not connected. Please connect it in Settings.');
  }

  const expiresAt = new Date(integration.expires_at).getTime();
  const nowMs = Date.now();
  const sixtySeconds = 60 * 1000;

  // Token is still valid — return it directly
  if (expiresAt - nowMs > sixtySeconds) {
    return integration.access_token;
  }

  // Token is expired or expiring soon — refresh it
  const refreshed = await refreshAccessToken(integration.refresh_token);

  // Persist the new token
  const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

  const { error: updateError } = await supabase
    .from('integrations')
    .update({
      access_token: refreshed.access_token,
      expires_at: newExpiresAt,
    })
    .eq('id', integration.id);

  if (updateError) {
    // Log but don't throw — we can still use the fresh token for this request
    console.error('Failed to persist refreshed token:', updateError.message);
  }

  return refreshed.access_token;
}

type RefreshResponse = {
  access_token: string;
  expires_in: number; // seconds
};

async function refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as RefreshResponse;
  return data;
}

// ---------------------------------------------------------------------------
// Google Analytics Admin API — list GA4 properties
// ---------------------------------------------------------------------------

type AdminAPIProperty = {
  name: string;       // e.g. "properties/123456789"
  displayName: string;
};

type AdminAPIAccount = {
  name: string;       // e.g. "accountSummaries/123"
  propertySummaries?: AdminAPIProperty[];
};

/**
 * Lists all GA4 properties the authenticated user has access to.
 * Uses the Analytics Admin API v1beta.
 */
export async function getGA4Properties(accessToken: string): Promise<GA4Property[]> {
  const res = await fetch(
    'https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      // Don't cache — always fetch fresh property list
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Analytics Admin API error (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { accountSummaries?: AdminAPIAccount[] };
  const properties: GA4Property[] = [];

  for (const account of data.accountSummaries ?? []) {
    for (const prop of account.propertySummaries ?? []) {
      // prop.name is "properties/XXXXXXXXX" — extract numeric ID
      const propertyId = prop.name.replace('properties/', '');
      properties.push({ propertyId, displayName: prop.displayName });
    }
  }

  return properties;
}

// ---------------------------------------------------------------------------
// Google Analytics Data API v1 — fetch report metrics
// ---------------------------------------------------------------------------

type DimensionValue = { value: string };
type MetricValue = { value: string };

type GARow = {
  dimensionValues?: DimensionValue[];
  metricValues?: MetricValue[];
};

type RunReportResponse = {
  rows?: GARow[];
};

/**
 * Fetches core GA4 metrics for a property over a date range.
 * Uses the Analytics Data API v1beta (runReport).
 */
export async function getGA4Data(
  accessToken: string,
  propertyId: string,
  startDate: string, // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
): Promise<GA4Data> {
  const baseUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  // Run all three report requests in parallel
  const [summaryRes, topPagesRes, trafficRes] = await Promise.all([
    // 1. Summary metrics (no dimensions needed)
    fetch(baseUrl, {
      method: 'POST',
      headers,
      cache: 'no-store',
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
        ],
      }),
    }),

    // 2. Top 5 pages by pageviews
    fetch(baseUrl, {
      method: 'POST',
      headers,
      cache: 'no-store',
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 5,
      }),
    }),

    // 3. Top 5 traffic sources (session source / medium)
    fetch(baseUrl, {
      method: 'POST',
      headers,
      cache: 'no-store',
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionSourceMedium' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 5,
      }),
    }),
  ]);

  // Check all responses
  for (const [label, res] of [
    ['Summary', summaryRes],
    ['Top Pages', topPagesRes],
    ['Traffic Sources', trafficRes],
  ] as [string, Response][]) {
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`GA4 Data API (${label}) error (${res.status}): ${body}`);
    }
  }

  const [summaryData, topPagesData, trafficData] = (await Promise.all([
    summaryRes.json(),
    topPagesRes.json(),
    trafficRes.json(),
  ])) as [RunReportResponse, RunReportResponse, RunReportResponse];

  // Parse summary row (single row, no dimensions)
  const summaryRow = summaryData.rows?.[0];
  const mv = (idx: number) => parseFloat(summaryRow?.metricValues?.[idx]?.value ?? '0');

  const sessions = Math.round(mv(0));
  const users = Math.round(mv(1));
  const pageviews = Math.round(mv(2));
  const avgSessionDuration = Math.round(mv(3)); // seconds
  const bounceRate = parseFloat(mv(4).toFixed(1));

  // Parse top pages
  const topPages = (topPagesData.rows ?? []).map((row) => ({
    pagePath: row.dimensionValues?.[0]?.value ?? '/',
    pageviews: Math.round(parseFloat(row.metricValues?.[0]?.value ?? '0')),
  }));

  // Parse traffic sources
  const trafficSources = (trafficData.rows ?? []).map((row) => ({
    sessionSourceMedium: row.dimensionValues?.[0]?.value ?? 'unknown',
    sessions: Math.round(parseFloat(row.metricValues?.[0]?.value ?? '0')),
  }));

  return {
    sessions,
    users,
    pageviews,
    avgSessionDuration,
    bounceRate,
    topPages,
    trafficSources,
  };
}
