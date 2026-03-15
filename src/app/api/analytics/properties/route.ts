import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidAccessToken, getGA4Properties } from '@/lib/google-analytics';
import { getMockGA4Properties } from '@/lib/mock-analytics';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const accessToken = await getValidAccessToken(user.id);
    const properties = await getGA4Properties(accessToken);

    // If the account has no properties, fall back to mock so the UI stays usable.
    if (properties.length === 0) {
      console.log('Using mock GA4 data (real account has no properties)');
      return NextResponse.json({ properties: getMockGA4Properties() });
    }

    return NextResponse.json({ properties });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch properties';
    console.error('GET /api/analytics/properties error:', message);
    console.log('Using mock GA4 data (real API unavailable)');
    return NextResponse.json({ properties: getMockGA4Properties() });
  }
}
