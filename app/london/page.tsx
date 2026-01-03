import Link from 'next/link';
import { getFeaturedProviders } from '@/lib/data';
import ProviderList from '@/components/ProviderList';

export default function LondonPage() {
  const featured = getFeaturedProviders();

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900">Pest control in London</h1>
        <p className="text-slate-600 mt-2">
          Browse providers serving Greater London. Start with the directory or explore by pest type.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/london/pest-control"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm"
          >
            View all providers
          </Link>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Featured providers</h2>
          <p className="text-slate-600 mt-1">
            A small preview of providers in the London directory.
          </p>

          <div className="mt-4">
            <ProviderList providers={featured} />
          </div>

          <div className="mt-6">
            <Link href="/london/pest-control" className="text-blue-600 hover:underline">
              See the full London provider list →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
