import Anthropic from '@anthropic-ai/sdk';
import type { GA4Data, GA4MetricComparison } from '@/types/analytics';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatMetrics(data: GA4Data, label: string): string {
  const pagesList = data.topPages
    .map((p, i) => `  ${i + 1}. ${p.pagePath} — ${p.pageviews.toLocaleString()} pageviews`)
    .join('\n');

  const sourcesList = data.trafficSources
    .map((s, i) => `  ${i + 1}. ${s.sessionSourceMedium} — ${s.sessions.toLocaleString()} sessions`)
    .join('\n');

  return `${label}:
- Sessions: ${data.sessions.toLocaleString()}
- Users: ${data.users.toLocaleString()}
- Pageviews: ${data.pageviews.toLocaleString()}
- Avg Session Duration: ${formatDuration(data.avgSessionDuration)}
- Bounce Rate: ${data.bounceRate.toFixed(1)}%
- Top Pages:
${pagesList}
- Traffic Sources:
${sourcesList}`;
}

/**
 * Calls the Claude API to generate a structured performance narrative.
 * Follows the prompt format defined in ARCHITECTURE.md exactly.
 */
export async function generateReportNarrative(
  data: GA4MetricComparison,
  clientName: string,
  clientWebsite: string,
  currentPeriodLabel: string,
  previousPeriodLabel: string,
): Promise<string> {
  const baselineSection = data.baseline
    ? `\n${formatMetrics(data.baseline, 'BASELINE (since reporting start)')}\n`
    : '';

  const prompt = `You are a professional marketing analytics reporter. Write a concise performance report for a business owner reviewing their website analytics.

Client: ${clientName}
Website: ${clientWebsite}

${formatMetrics(data.current, `CURRENT PERIOD (${currentPeriodLabel})`)}

${formatMetrics(data.previous, `PREVIOUS PERIOD (${previousPeriodLabel})`)}
${baselineSection}
Write a structured report with EXACTLY these 4 sections and headings:

## Executive Summary
Write 2-3 sentences summarizing overall performance and the most important story in the data.

## Key Wins
List exactly 3 bullet points highlighting the strongest positive results. Include specific numbers and percentage changes (e.g., "Sessions grew 23% from 1,847 to 2,276").

## Areas of Attention
List 1-2 bullet points noting honest concerns or areas that need improvement. Be constructive, not alarming.

## Recommendations
List 2-3 specific, actionable steps the client can take based on the data.

Rules:
- Write in plain English. No marketing jargon. The reader is a business owner, not a marketer.
- Always cite specific numbers from the data.
- Tone: professional and constructive. The reader should feel their investment is paying off.
- Language: ENGLISH only. Never use any other language.
- Keep the entire report under 400 words.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const block = message.content[0];
  if (block.type !== 'text') {
    throw new Error('Unexpected response type from Claude API');
  }

  return block.text;
}
