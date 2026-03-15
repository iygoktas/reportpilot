import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('OAuth code exchange error:', error.message);
        return NextResponse.redirect(`${origin}/login?error=auth`);
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    } catch (err) {
      console.error('Unexpected auth callback error:', err);
      return NextResponse.redirect(`${origin}/login?error=unexpected`);
    }
  }

  // No code present — something went wrong upstream
  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}
