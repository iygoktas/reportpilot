import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import GenerateReportForm from '@/components/reports/GenerateReportForm';

export default async function GenerateReportPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>;
}) {
  const { client_id } = await searchParams;

  if (!client_id) notFound();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', client_id)
    .eq('user_id', user.id)
    .single();

  if (error || !client) notFound();

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/clients/${client.id}`}
          className="text-base text-stone-500 hover:text-stone-700 transition-colors"
        >
          ← Back to {client.name}
        </Link>
        <h1 className="text-xl font-bold text-stone-800 mt-3 md:text-2xl">
          Generate Monthly Report
        </h1>
        <p className="text-base text-stone-500 mt-1">
          Select a reporting period and let AI write the narrative for you.
        </p>
      </div>

      <GenerateReportForm client={client} />
    </div>
  );
}
