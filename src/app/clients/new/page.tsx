'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { z } from 'zod';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { GA4Property } from '@/types/analytics';

const newClientSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(100, 'Name is too long'),
  website_url: z
    .string()
    .max(500)
    .refine(
      (val) => val === '' || /^https?:\/\/.+\..+/.test(val),
      'Please enter a valid URL (e.g. https://example.com)'
    )
    .optional(),
  start_date: z.string().optional(),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof newClientSchema>, string>>;
type GAStatus = 'loading' | 'connected' | 'not_connected' | 'error';

export default function NewClientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // GA4 property selection state
  const [gaStatus, setGaStatus] = useState<GAStatus>('loading');
  const [properties, setProperties] = useState<GA4Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');

  useEffect(() => {
    async function loadGA4() {
      const supabase = createClient();

      // Step 1: check if the integration row exists directly in the DB.
      // This is the authoritative "is GA connected?" check — it's independent
      // of whether the GA4 API call itself succeeds.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log('[NewClient] current user id:', user?.id ?? 'none');

      const { data: integration, error: intError } = await supabase
        .from('integrations')
        .select('id')
        .eq('user_id', user?.id ?? '')
        .eq('provider', 'google')
        .maybeSingle();

      console.log('[NewClient] integrations query result:', { integration, error: intError });

      if (intError || !integration) {
        console.log('[NewClient] GA not connected — showing message');
        setGaStatus('not_connected');
        return;
      }

      // Step 2: integration exists — fetch the actual GA4 properties list.
      console.log('[NewClient] GA connected — fetching properties from API');
      try {
        const res = await fetch('/api/analytics/properties');
        const json = await res.json() as { properties?: GA4Property[]; error?: string };
        console.log('[NewClient] /api/analytics/properties response:', res.status, json);

        if (!res.ok) {
          // Integration exists but the GA4 API call failed (e.g. bad token).
          // Still show as connected but with an empty list so the user knows GA is linked.
          console.warn('[NewClient] Properties API failed, but GA IS connected:', json.error);
          setGaStatus('connected');
          setProperties([]);
          return;
        }

        setProperties(json.properties ?? []);
        setGaStatus('connected');
      } catch (err) {
        console.error('[NewClient] Properties fetch threw:', err);
        // Same: integration exists, just couldn't load properties right now.
        setGaStatus('connected');
        setProperties([]);
      }
    }

    loadGA4();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const raw = {
      name: (formData.get('name') as string).trim(),
      website_url: (formData.get('website_url') as string).trim(),
      start_date: formData.get('start_date') as string,
    };

    const result = newClientSchema.safeParse(raw);

    if (!result.success) {
      const errors: FieldErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof FieldErrors;
        errors[field] = err.message;
      });
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Session expired. Please sign in again.');
        router.push('/login');
        return;
      }

      const { error } = await supabase.from('clients').insert({
        user_id: user.id,
        name: result.data.name,
        website_url: result.data.website_url || null,
        start_date: result.data.start_date || null,
        ga4_property_id: selectedPropertyId || null,
      });

      if (error) throw error;

      toast.success(`${result.data.name} added successfully`);
      router.push('/clients');
    } catch (err) {
      console.error('Failed to create client:', err);
      toast.error('Failed to add client. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg">
      {/* Page header */}
      <div className="mb-8">
        <Link
          href="/clients"
          className="text-base text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← Back to Clients
        </Link>
        <h1 className="text-xl font-bold text-slate-800 mt-3 md:text-2xl">Add Client</h1>
        <p className="text-base text-slate-500 mt-1">
          Add a client to start generating reports for them.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Client Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-base font-medium text-slate-700 mb-2"
            >
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Acme Corp"
              autoComplete="off"
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {fieldErrors.name && (
              <p className="mt-2 text-sm text-red-500">{fieldErrors.name}</p>
            )}
          </div>

          {/* Website URL */}
          <div>
            <label
              htmlFor="website_url"
              className="block text-base font-medium text-slate-700 mb-2"
            >
              Website URL{' '}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              id="website_url"
              name="website_url"
              type="url"
              placeholder="https://example.com"
              autoComplete="off"
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {fieldErrors.website_url && (
              <p className="mt-2 text-sm text-red-500">{fieldErrors.website_url}</p>
            )}
          </div>

          {/* GA4 Property */}
          <div>
            <label
              htmlFor="ga4_property_id"
              className="block text-base font-medium text-slate-700 mb-2"
            >
              GA4 Property{' '}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>

            {gaStatus === 'loading' && (
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                Loading properties…
              </div>
            )}

            {gaStatus === 'connected' && (
              <>
                {properties.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                    No GA4 properties found in your Google account.
                  </div>
                ) : (
                  <select
                    id="ga4_property_id"
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">— Select a property —</option>
                    {properties.map((p) => (
                      <option key={p.propertyId} value={p.propertyId}>
                        {p.displayName}
                      </option>
                    ))}
                  </select>
                )}
                {selectedPropertyId && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-green-600">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Property selected
                  </p>
                )}
              </>
            )}

            {(gaStatus === 'not_connected' || gaStatus === 'error') && (
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-slate-400" />
                <span>
                  Connect Google Analytics in{' '}
                  <Link href="/settings" className="text-blue-500 hover:text-blue-600 underline underline-offset-2">
                    Settings
                  </Link>{' '}
                  to select a property.
                </span>
              </div>
            )}

            <p className="mt-2 text-sm text-slate-400">
              You can connect a property now or add it later from the client page.
            </p>
          </div>

          {/* Start Date */}
          <div>
            <label
              htmlFor="start_date"
              className="block text-base font-medium text-slate-700 mb-2"
            >
              Reporting Start Date{' '}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <p className="mt-2 text-sm text-slate-400">
              Used as the baseline period when generating AI reports.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-5 py-2.5 text-base font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding…' : 'Add Client'}
            </button>
            <Link
              href="/clients"
              className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg px-5 py-2.5 text-base font-medium transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
