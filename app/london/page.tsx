import { getFeaturedProviders, getAllProviders } from '@/lib/data';
import Hero from '@/components/Hero';
import PdfCTA from '@/components/PdfCTA';
import ProviderList from '@/components/ProviderList';
import FAQ from '@/components/FAQ';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pest Control London | PestPro Index',
  description: 'Find trusted pest control providers in London. Independent index for residential and commercial pest services.',
};

export default function LondonPage() {
  const featuredProviders = getFeaturedProviders();
  const allProviders = getAllProviders();
  // Preview subset for main list (just next 6 for demo)
  const previewProviders = allProviders.filter(p => !featuredProviders.includes(p)).slice(0, 6);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* 1) Hero */}
      <Hero />

      {/* 2) Intro + Residential DIY PDF CTA */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">London's Independent Pest Control Directory</h2>
          <p className="text-lg text-slate-600">
            We list verified providers across all 32 London boroughs. Not a marketplace—just a direct connection to local experts.
          </p>
        </div>
        <PdfCTA />
      </section>

      {/* 3) Featured Providers */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Featured Providers</h2>
            <span className="text-sm text-slate-500">Sponsored Listings</span>
          </div>
          <ProviderList providers={featuredProviders} />
        </div>
      </section>

      {/* 4) Main Provider Finder (Preview) */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Local Providers</h2>
          <ProviderList providers={previewProviders} />
          
          <div className="mt-12 text-center">
            <Link 
              href="/london/pest-control" 
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              View All {allProviders.length} Providers
            </Link>
          </div>
        </div>
      </section>

      {/* 5) Secondary PDF Promotion */}
      <PdfCTA id="diy-guide-secondary" secondary={true} />

      {/* 6) FAQs */}
      <FAQ />

      {/* 7) Boroughs / Coverage */}
      <section className="py-12 px-4 bg-slate-900 text-slate-400 text-sm">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="font-bold text-white mb-4 uppercase tracking-wider">Coverage Area</h3>
          <p>
            Serving Greater London including: Camden, Greenwich, Hackney, Hammersmith and Fulham, Islington, Kensington and Chelsea, Lambeth, Lewisham, Southwark, Tower Hamlets, Wandsworth, Westminster, Barking and Dagenham, Barnet, Bexley, Brent, Bromley, Croydon, Ealing, Enfield, Haringey, Harrow, Havering, Hillingdon, Hounslow, Kingston upon Thames, Merton, Newham, Redbridge, Richmond upon Thames, Sutton, Waltham Forest.
          </p>
        </div>
      </section>
    </main>
  );
}
