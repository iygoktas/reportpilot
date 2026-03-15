import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidAccessToken, getGA4Properties } from '@/lib/google-analytics';

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
    return NextResponse.json({ properties });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch properties';
    console.error('GET /api/analytics/properties error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
