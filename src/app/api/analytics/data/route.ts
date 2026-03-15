import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getValidAccessToken, getGA4Data } from '@/lib/google-analytics';

const querySchema = z.object({
  property_id: z.string().min(1, 'property_id is required'),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'start_date must be YYYY-MM-DD'),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'end_date must be YYYY-MM-DD'),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse and validate query params
  const { searchParams } = new URL(request.url);
  const raw = {
    property_id: searchParams.get('property_id') ?? '',
    start_date:  searchParams.get('start_date') ?? '',
    end_date:    searchParams.get('end_date') ?? '',
  };

  const parsed = querySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { property_id, start_date, end_date } = parsed.data;

  try {
    const accessToken = await getValidAccessToken(user.id);
    const data = await getGA4Data(accessToken, property_id, start_date, end_date);
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch analytics data';
    console.error('GET /api/analytics/data error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
