// A single GA4 property returned by the Admin API
export type GA4Property = {
  propertyId: string;
  displayName: string;
};

// One page row (top pages by pageviews)
export type GA4PageRow = {
  pagePath: string;
  pageviews: number;
};

// One traffic source row
export type GA4TrafficSource = {
  sessionSourceMedium: string;
  sessions: number;
};

// Core metrics fetched from the Data API for a single period
export type GA4Data = {
  sessions: number;
  users: number;
  pageviews: number;
  avgSessionDuration: number; // seconds
  bounceRate: number;         // 0–100
  topPages: GA4PageRow[];     // top 5 by pageviews
  trafficSources: GA4TrafficSource[]; // top 5 by sessions
};

// Current period paired with previous period for AI narrative
export type GA4MetricComparison = {
  current: GA4Data;
  previous: GA4Data;
  baseline?: GA4Data; // from client.start_date if available
};
