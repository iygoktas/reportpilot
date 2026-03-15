'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Loader2, Pencil } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { GA4Property } from '@/types/analytics';

interface Props {
  clientId: string;
  currentPropertyId: string | null;
  isGoogleConnected: boolean;
}

type FetchStatus = 'idle' | 'loading' | 'done' | 'error';

export default function ConnectPropertyButton({
  clientId,
  currentPropertyId,
  isGoogleConnected,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle');
  const [properties, setProperties] = useState<GA4Property[]>([]);
  const [selectedId, setSelectedId] = useState(currentPropertyId ?? '');
  const [isSaving, setIsSaving] = useState(false);

  async function openDialog() {
    setSelectedId(currentPropertyId ?? '');
    setOpen(true);
    if (fetchStatus === 'idle' || fetchStatus === 'error') {
      setFetchStatus('loading');
      try {
        const res = await fetch('/api/analytics/properties');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json() as { properties: GA4Property[] };
        setProperties(json.properties ?? []);
        setFetchStatus('done');
      } catch {
        setFetchStatus('error');
      }
    }
  }

  async function handleSave() {
    if (!selectedId) return;
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('clients')
        .update({ ga4_property_id: selectedId })
        .eq('id', clientId);

      if (error) throw error;

      const propertyName = properties.find((p) => p.propertyId === selectedId)?.displayName ?? selectedId;
      toast.success(`GA4 property connected: ${propertyName}`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Failed to update GA4 property:', err);
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDisconnect() {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('clients')
        .update({ ga4_property_id: null })
        .eq('id', clientId);

      if (error) throw error;

      toast.success('GA4 property disconnected.');
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Failed to disconnect GA4 property:', err);
      toast.error('Failed to disconnect. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  // Not connected to Google Analytics at all
  if (!isGoogleConnected) {
    return (
      <span className="text-base text-slate-400 italic">
        <Link href="/settings" className="text-blue-500 hover:text-blue-600 not-italic underline underline-offset-2">
          Connect Google Analytics
        </Link>{' '}
        to add a property
      </span>
    );
  }

  return (
    <>
      {/* Trigger */}
      {currentPropertyId ? (
        <button
          onClick={openDialog}
          className="inline-flex items-center gap-1.5 text-base text-slate-800 hover:text-blue-600 transition-colors group"
        >
          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
          <span className="font-mono text-sm">{currentPropertyId}</span>
          <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
        </button>
      ) : (
        <button
          onClick={openDialog}
          className="text-base text-blue-500 hover:text-blue-600 transition-colors"
        >
          Connect Property
        </button>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentPropertyId ? 'Change GA4 Property' : 'Connect GA4 Property'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            {fetchStatus === 'loading' && (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading your GA4 properties…
              </div>
            )}

            {fetchStatus === 'error' && (
              <div className="flex items-center gap-2 text-sm text-red-500 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Failed to load properties. Check your connection and try again.
              </div>
            )}

            {fetchStatus === 'done' && properties.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                No GA4 properties found in your Google account.
              </div>
            )}

            {fetchStatus === 'done' && properties.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Select a property
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">— Choose a property —</option>
                  {properties.map((p) => (
                    <option key={p.propertyId} value={p.propertyId}>
                      {p.displayName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {currentPropertyId && (
              <button
                onClick={handleDisconnect}
                disabled={isSaving}
                className="text-sm text-red-500 hover:text-red-600 transition-colors disabled:opacity-60 sm:mr-auto"
              >
                Remove property
              </button>
            )}
            <div className="flex gap-2 sm:ml-auto">
              <button
                onClick={() => setOpen(false)}
                disabled={isSaving}
                className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !selectedId || fetchStatus !== 'done'}
                className="bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving…
                  </span>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
