import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');

  if (!clientId) {
    return NextResponse.json(
      { error: 'client_id query parameter is required' },
      { status: 400 }
    );
  }

  // Verify the client belongs to the requesting user
  const { data: client, error: clientError } = await adminSupabase
    .from('clients')
    .select('user_id')
    .eq('id', clientId)
    .single();

  if (clientError || !client || client.user_id !== user.id) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const { data: reports, error: reportsError } = await adminSupabase
    .from('reports')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (reportsError) {
    console.error('Failed to fetch reports:', reportsError.message);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }

  return NextResponse.json({ reports: reports ?? [] });
}
