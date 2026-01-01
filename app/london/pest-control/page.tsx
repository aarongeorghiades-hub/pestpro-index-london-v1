import { getAllProviders } from '@/lib/data';
import ProviderList from '@/components/ProviderList';
import FilterBar from '@/components/FilterBar';
import Link from 'next/link';
import type { Metadata } from 'next';

// Force dynamic rendering for search params
export const dynamic = 'force-dynamic';

// NOTE: In App Router, putting <meta name="robots"> inside the page body is unreliable.
// We generate metadata per-request so "noindex" lands in <head> when filters are active.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;

  const q = typeof params.q === 'string' ? params.q.trim() : '';
  const pest = typeof params.pest === 'string' ? params.pest.trim() : '';
  const type = typeof params.type === 'string' ? params.type.trim() : '';
  const emergency = params.emergency === 'true';

  const hasFilters = Boolean(q || pest || type || emergency);

  return {
    title: 'All Pest Control Providers London | PestPro Index',
    description:
      'Browse our complete London pest control directory. Filter by pest type, service type, and emergency call-out availability.',
    alternates: {
      canonical: '/london/pest-control',
    },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function PestControlPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const allProviders = getAllProviders();

  // Filter logic
  let filteredProviders = allProviders;

  // 1) Provider name search
  const query = typeof params.q === 'string' ? params.q.toLowerCase().trim() : '';
  if (query) {
    filteredProviders = filteredProviders.filter((p) =>
      (p.name ?? '').toLowerCase().includes(query)
    );
  }

  // 2) Pest type (case-insensitive)
  const pestType = typeof params.pest === 'string' ? params.pest.toLowerCase().trim() : '';
  if (pestType) {
    filteredProviders = filteredProviders.filter((p) => {
      const pests = Array.isArray(p.pests_supported) ? p.pests_supported : [];
      const pestsLower = pests.map((x) => (x ?? '').toLowerCase());
      return pestsLower.includes(pestType);
    });
  }

  // 3) Service type (honest: unknown/null should not pass an affirmative filter)
  const serviceType = typeof params.type === 'string' ? params.type : '';
  if (serviceType === 'residential') {
    filteredProviders = filteredProviders.filter((p) => p.residential === true);
  } else if (serviceType === 'commercial') {
    filteredProviders = filteredProviders.filter((p) => p.commercial === true);
  }

  // 4) Emergency call-out (honest)
  const emergency = params.emergency === 'true';
  if (emergency) {
    filteredProviders = filteredProviders.filter((p) => p.emergency_callout === true);
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Link href="/london" className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to London overview
          </Link>

          <h1 className="text-3xl font-bold text-slate-900">London pest control providers</h1>

          <p className="text-slate-600 mt-2">
            Browse {allProviders.length} listed providers serving Greater London. Use the filters
            below, then contact providers directly.
          </p>
        </div>

        {/* Filter UI lives in this component. If the filters feel “missing”, this is the file we fix next. */}
        <FilterBar />

        <div className="mb-4 text-sm text-slate-500">
          Showing {filteredProviders.length} provider{filteredProviders.length === 1 ? '' : 's'}
        </div>

        <ProviderList providers={filteredProviders} />
      </div>
    </main>
  );
}
