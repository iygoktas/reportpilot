import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const putBodySchema = z.object({
  ai_narrative: z.string().min(1, 'ai_narrative is required'),
});

export async function PUT(
  request: NextRequest,
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = putBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parsed.error.issues },
      { status: 400 }
    );
  }

  // Fetch report then verify ownership via client → user_id
  const { data: report, error: reportError } = await adminSupabase
    .from('reports')
    .select('id, client_id')
    .eq('id', id)
    .single();

  if (reportError || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  const { data: client, error: clientError } = await adminSupabase
    .from('clients')
    .select('user_id')
    .eq('id', report.client_id)
    .single();

  if (clientError || !client || client.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: updated, error: updateError } = await adminSupabase
    .from('reports')
    .update({ ai_narrative: parsed.data.ai_narrative })
    .eq('id', id)
    .select()
    .single();

  if (updateError || !updated) {
    console.error('Failed to update report narrative:', updateError?.message);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }

  return NextResponse.json({ report: updated });
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

  // Verify ownership
  const { data: client, error: clientError } = await adminSupabase
    .from('clients')
    .select('user_id')
    .eq('id', report.client_id)
    .single();

  if (clientError || !client || client.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ report });
}
