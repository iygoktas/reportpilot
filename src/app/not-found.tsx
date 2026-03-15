import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-6xl font-bold text-stone-300">404</p>
        <h1 className="mt-4 text-xl font-semibold text-stone-700">Page not found</h1>
        <p className="mt-2 text-sm text-stone-500">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="bg-orange-600 text-white hover:bg-orange-700 px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
