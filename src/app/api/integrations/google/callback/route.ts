import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!res.ok) {
      const body = await res.text();
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

  // Persist tokens — upsert so re-connecting overwrites the old row
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  const { error: upsertError } = await supabase
    .from('integrations')
    .upsert(
      {
        user_id: userId,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
      },
      { onConflict: 'user_id,provider' }
    );

  if (upsertError) {
    console.error('Failed to save integration:', upsertError.message);
    return NextResponse.redirect(`${origin}/settings?ga_error=save_failed`);
  }

  return NextResponse.redirect(`${origin}/settings?ga_connected=true`);
}
