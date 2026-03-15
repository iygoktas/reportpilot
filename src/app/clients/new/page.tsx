'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

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

export default function NewClientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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
