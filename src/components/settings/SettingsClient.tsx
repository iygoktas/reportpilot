'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Link, Unlink, Loader2, CreditCard, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  isGoogleConnected: boolean;
  connectedAt: string | null;
  plan: 'free' | 'pro';
  clientCount: number;
  fullName: string | null;
  email: string;
  avatarUrl?: string | null;
};

const GA_ERROR_MESSAGES: Record<string, string> = {
  denied: 'Google Analytics access was denied.',
  missing_params: 'OAuth callback was missing required parameters.',
  invalid_state: 'OAuth state parameter was invalid.',
  unauthorized: 'Session mismatch during OAuth flow.',
  token_exchange: 'Failed to exchange authorization code for tokens.',
  save_failed: 'Connected successfully but failed to save tokens. Please try again.',
};

export default function SettingsClient({
  isGoogleConnected,
  connectedAt,
  plan,
  clientCount,
  fullName,
  email,
  avatarUrl,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    const gaConnected = searchParams.get('ga_connected');
    const gaError = searchParams.get('ga_error');

    if (gaConnected === 'true') {
      toast.success('Google Analytics connected successfully.');
    } else if (gaError) {
      const message = GA_ERROR_MESSAGES[gaError] ?? 'Failed to connect Google Analytics.';
      toast.error(message);
    }
  }, [searchParams]);

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      const res = await fetch('/api/integrations/google/disconnect', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to disconnect');
      toast.success('Google Analytics disconnected.');
      router.refresh();
    } catch {
      toast.error('Failed to disconnect. Please try again.');
    } finally {
      setDisconnecting(false);
    }
  }

  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : email[0].toUpperCase();

  const clientLimit = plan === 'pro' ? 10 : 5;

  return (
    <div className="space-y-6">

      {/* Profile */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={fullName ?? email}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-semibold">
              {initials}
            </div>
          )}
          <div>
            <p className="text-base font-medium text-slate-800">{fullName ?? '—'}</p>
            <p className="text-sm text-slate-500">{email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Name</p>
            <p className="text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              {fullName ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Email</p>
            <p className="text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              {email}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Profile information is managed by your Google account.
        </p>
      </div>

      {/* Integrations */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Integrations</h2>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Google icon */}
            <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center bg-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Google Analytics</p>
              {isGoogleConnected ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Connected</span>
                  {connectedAt && (
                    <span className="text-xs text-slate-400">
                      · since {new Date(connectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500">Not connected</span>
                </div>
              )}
            </div>
          </div>
          {isGoogleConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
            >
              {disconnecting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Unlink className="w-4 h-4 mr-1.5" />
              )}
              Disconnect
            </Button>
          ) : (
            <a
              href="/api/integrations/google/connect"
              className="inline-flex items-center gap-1.5 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <Link className="w-4 h-4" />
              Connect
            </a>
          )}
        </div>
      </div>

      {/* Billing */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Billing</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-800">
              {plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              {plan === 'pro' ? '$19 / month' : 'Free forever'}
            </p>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              plan === 'pro'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {plan === 'pro' ? 'Pro' : 'Free'}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Client usage</span>
            </div>
            <span className="text-sm text-slate-500">
              {clientCount} / {clientLimit} clients
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                clientCount / clientLimit >= 0.8 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min((clientCount / clientLimit) * 100, 100)}%` }}
            />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled
          className="text-slate-500 border-slate-200 cursor-not-allowed"
        >
          <CreditCard className="w-4 h-4 mr-1.5" />
          Manage Subscription
        </Button>
        <p className="text-xs text-slate-400 mt-2">Stripe billing portal coming soon.</p>
      </div>
    </div>
  );
}
