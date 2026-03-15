import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;    // seconds until expiry
  token_type: string;
  scope: string;
};

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  // User denied access on Google's consent screen
  if (errorParam) {
    console.error('Google OAuth denied:', errorParam);
    return NextResponse.redirect(`${origin}/settings?ga_error=denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/settings?ga_error=missing_params`);
  }

  // Decode and validate state
  let userId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8')) as {
      userId?: string;
    };
    if (!decoded.userId) throw new Error('missing userId in state');
    userId = decoded.userId;
  } catch (err) {
    console.error('Invalid OAuth state param:', err);
    return NextResponse.redirect(`${origin}/settings?ga_error=invalid_state`);
  }

  // Verify the decoded userId matches the logged-in session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return NextResponse.redirect(`${origin}/settings?ga_error=unauthorized`);
  }

  // Exchange authorization code for tokens
  let tokens: TokenResponse;
  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`;
    console.log('[GA OAuth] redirect_uri sent to token exchange:', redirectUri);

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[GA OAuth] Token exchange failed — status:', res.status, '— body:', body);
      throw new Error(`Token exchange failed (${res.status}): ${body}`);
    }

    tokens = (await res.json()) as TokenResponse;

    if (!tokens.refresh_token) {
      // This happens if the user already granted access and Google didn't re-issue
      // a refresh_token. The connect route uses prompt=consent to prevent this,
      // but handle it gracefully just in case.
      throw new Error('No refresh_token returned. Try disconnecting and reconnecting.');
    }
  } catch (err) {
    console.error('Token exchange error:', err);
    return NextResponse.redirect(`${origin}/settings?ga_error=token_exchange`);
  }

  // Persist tokens — use admin client (service role) to bypass RLS since we've
  // already verified the user's identity above via auth.getUser().
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
  const payload = {
    user_id: userId,
    provider: 'google',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: expiresAt,
  };
  console.log('[GA OAuth] Saving integration for user:', userId, '— payload keys:', Object.keys(payload));

  const adminSupabase = createAdminClient();
  const { error: upsertError } = await adminSupabase
    .from('integrations')
    .upsert(payload, { onConflict: 'user_id,provider' });

  if (upsertError) {
    console.error('[GA OAuth] Supabase upsert error — code:', upsertError.code, '— message:', upsertError.message, '— details:', upsertError.details, '— hint:', upsertError.hint);
    return NextResponse.redirect(`${origin}/settings?ga_error=save_failed`);
  }

  return NextResponse.redirect(`${origin}/settings?ga_connected=true`);
}
