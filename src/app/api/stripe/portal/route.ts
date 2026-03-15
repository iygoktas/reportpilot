import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCustomerPortalSession } from '@/lib/stripe';

export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No active subscription found' },
      { status: 404 }
    );
  }

  try {
    const session = await createCustomerPortalSession(profile.stripe_customer_id);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe portal error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Failed to open billing portal' }, { status: 500 });
  }
}
