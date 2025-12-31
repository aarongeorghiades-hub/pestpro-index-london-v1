import { getAllProviders } from '@/lib/data';
import ProviderList from '@/components/ProviderList';
import FilterBar from '@/components/FilterBar';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Pest Control Providers London | PestPro Index',
  description: 'Browse our complete directory of pest control services in London. Filter by pest type, service type, and emergency availability.',
  alternates: {
    canonical: '/london/pest-control',
  },
};

// Force dynamic rendering for search params
export const dynamic = 'force-dynamic';

export default async function PestControlPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const allProviders = getAllProviders();
  
  // Filter logic
  let filteredProviders = allProviders;

  // 1. Search Query
  const query = typeof params.q === 'string' ? params.q.toLowerCase() : '';
  if (query) {
    filteredProviders = filteredProviders.filter(p => 
      p.name.toLowerCase().includes(query)
    );
  }

  // 2. Pest Type
  const pestType = typeof params.pest === 'string' ? params.pest.toLowerCase() : '';
  if (pestType) {
    filteredProviders = filteredProviders.filter(p => 
      p.pests_supported && p.pests_supported.includes(pestType)
    );
  }

  // 3. Service Type
  const serviceType = typeof params.type === 'string' ? params.type : '';
  if (serviceType === 'residential') {
    filteredProviders = filteredProviders.filter(p => p.residential);
  } else if (serviceType === 'commercial') {
    filteredProviders = filteredProviders.filter(p => p.commercial);
  }

  // 4. Emergency
  const emergency = params.emergency === 'true';
  if (emergency) {
    filteredProviders = filteredProviders.filter(p => p.emergency_callout);
  }

  // Check if filters are active for noindex rule
  const hasFilters = query || pestType || serviceType || emergency;

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      {hasFilters && (
        <meta name="robots" content="noindex" />
      )}
      
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Link href="/london" className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to London Overview
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Find Pest Control in London</h1>
          <p className="text-slate-600 mt-2">
            Browse our directory of {allProviders.length} verified pest control providers serving the Greater London area.
          </p>
        </div>

        <FilterBar />

        <div className="mb-4 text-sm text-slate-500">
          Showing {filteredProviders.length} providers
        </div>

        <ProviderList providers={filteredProviders} />
      </div>
    </main>
  );
}
