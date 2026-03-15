/**
 * Mock GA4 data for development/testing when no real GA4 property is available.
 * All values are realistic but fabricated. Remove / disable when real data is available.
 */

import type { GA4Data, GA4Property } from '@/types/analytics';

export const MOCK_PROPERTY_IDS = ['123456789', '987654321'];

export function getMockGA4Properties(): GA4Property[] {
  return [
    { propertyId: '123456789', displayName: 'Demo - acmecorp.com' },
    { propertyId: '987654321', displayName: 'Demo - testsite.io' },
  ];
}

/**
 * Deterministic-ish seeded random: produces a float in [0, 1) from a string seed.
 * Not cryptographic — just enough to get consistent but varied numbers per period.
 */
function seededRand(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h ^= h << 13;
    h ^= h >> 17;
    h ^= h << 5;
    return ((h >>> 0) / 0xffffffff);
  };
}

/** Returns a random integer between min and max (inclusive). */
function randInt(rand: () => number, min: number, max: number): number {
  return Math.round(min + rand() * (max - min));
}

/** Returns a random float between min and max, rounded to 1 decimal. */
function randFloat(rand: () => number, min: number, max: number): number {
  return parseFloat((min + rand() * (max - min)).toFixed(1));
}

export function getMockGA4Data(
  propertyId: string,
  startDate: string,
  endDate: string
): GA4Data {
  // Seed on property + period so the same request always returns the same values,
  // but different periods return different values (simulating monthly variation).
  const rand = seededRand(`${propertyId}:${startDate}:${endDate}`);

  const sessions = randInt(rand, 1200, 2500);
  const users = randInt(rand, Math.round(sessions * 0.65), Math.round(sessions * 0.85));
  const pageviews = randInt(rand, Math.round(sessions * 2.2), Math.round(sessions * 2.8));
  const avgSessionDuration = randInt(rand, 45, 180); // seconds
  const bounceRate = randFloat(rand, 35, 65);

  const pages = [
    '/',
    '/about',
    '/services',
    '/contact',
    '/blog',
    '/pricing',
    '/case-studies',
  ];

  const topPages = pages.slice(0, 5).map((pagePath, i) => ({
    pagePath,
    pageviews: Math.round(pageviews * [0.35, 0.20, 0.15, 0.10, 0.08][i]),
  }));

  const sources = [
    'google / organic',
    'direct / (none)',
    'google / cpc',
    'linkedin.com / referral',
    'newsletter / email',
  ];

  const trafficSources = sources.map((sessionSourceMedium, i) => ({
    sessionSourceMedium,
    sessions: Math.round(sessions * [0.40, 0.25, 0.15, 0.10, 0.07][i]),
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

/**
 * Returns mock data for a "previous period" — same shape but ~10–20% lower
 * numbers so reports show realistic growth trends.
 */
export function getMockPreviousData(
  propertyId: string,
  startDate: string,
  endDate: string
): GA4Data {
  const current = getMockGA4Data(propertyId, startDate, endDate);
  const rand = seededRand(`prev:${propertyId}:${startDate}:${endDate}`);
  const factor = 0.80 + rand() * 0.10; // 80–90% of current

  return {
    sessions: Math.round(current.sessions * factor),
    users: Math.round(current.users * factor),
    pageviews: Math.round(current.pageviews * factor),
    avgSessionDuration: Math.round(current.avgSessionDuration * (0.90 + rand() * 0.15)),
    bounceRate: parseFloat((current.bounceRate * (1.02 + rand() * 0.10)).toFixed(1)),
    topPages: current.topPages.map((p) => ({
      ...p,
      pageviews: Math.round(p.pageviews * factor),
    })),
    trafficSources: current.trafficSources.map((s) => ({
      ...s,
      sessions: Math.round(s.sessions * factor),
    })),
  };
}
