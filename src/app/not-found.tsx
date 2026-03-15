import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-6xl font-bold text-slate-300">404</p>
        <h1 className="mt-4 text-xl font-semibold text-slate-700">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="bg-blue-500 text-white hover:bg-blue-600 px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
