import { getProvidersByPest } from '@/lib/data';
import ProviderList from '@/components/ProviderList';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ pestSlug: string }>;
}

const VALID_PESTS = ['rats', 'mice', 'bed-bugs', 'wasps', 'ants', 'cockroaches', 'fleas', 'moths', 'squirrels'];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pestSlug } = await params;
  const pestName = pestSlug.replace(/-/g, ' ');
  
  if (!VALID_PESTS.includes(pestSlug)) {
    return { title: 'Page Not Found' };
  }

  return {
    title: `${pestName.charAt(0).toUpperCase() + pestName.slice(1)} Control London | PestPro Index`,
    description: `Find trusted ${pestName} control experts in London. Verified providers for ${pestName} removal and treatment.`,
  };
}

export async function generateStaticParams() {
  return VALID_PESTS.map((pest) => ({
    pestSlug: pest,
  }));
}

export default async function PestPage({ params }: Props) {
  const { pestSlug } = await params;
  
  if (!VALID_PESTS.includes(pestSlug)) {
    notFound();
  }

  const pestName = pestSlug.replace(/-/g, ' ');
  const providers = getProvidersByPest(pestSlug);

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Link href="/london" className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to London Overview
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 capitalize">{pestName} Control in London</h1>
          <p className="text-slate-600 mt-2">
            Found {providers.length} providers specializing in {pestName} removal across London.
          </p>
        </div>

        <ProviderList providers={providers} />
        
        <div className="mt-12 text-center">
          <Link 
            href="/london/pest-control" 
            className="inline-block bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3 px-8 rounded-lg transition-colors"
          >
            View All Pest Control Providers
          </Link>
        </div>
      </div>
    </main>
  );
}
