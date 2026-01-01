import { getFeaturedProviders, getAllProviders } from '@/lib/data';
import Hero from '@/components/Hero';
import PdfCTA from '@/components/PdfCTA';
import ProviderList from '@/components/ProviderList';
import FAQ from '@/components/FAQ';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pest Control London | PestPro Index',
  description:
    'Browse a London pest control directory. Filter by pest type, service type, and emergency call-out, then contact providers directly.',
};

export default function LondonPage() {
  const allProviders = getAllProviders();

  // London overview must be slim: featured preview only (cap at 8).
  // We cap here to prevent the page drifting into a full index.
  const featuredProviders = getFeaturedProviders().slice(0, 8);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* 1) Hero */}
      <Hero />

      {/* 2) Intro + Residential DIY PDF CTA */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            London&apos;s independent pest control directory
          </h2>
          <p className="text-lg text-slate-600">
            A practical directory — not a marketplace. Filter the full London list by need, then contact providers
            directly.
          </p>
        </div>
        <PdfCTA />
      </section>

      {/* 3) Featured Providers (preview only) */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3 mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Featured providers</h2>

            <Link href="/london/pest-control" className="text-sm text-blue-600 hover:underline">
              View the full London provider list &rarr;
            </Link>
          </div>

          <ProviderList providers={featuredProviders} />

          <div className="mt-10 text-center">
            <Link
              href="/london/pest-control"
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              View the full London provider list ({allProviders.length})
            </Link>
          </div>
        </div>
      </section>

      {/* 4) Secondary PDF Promotion */}
      <PdfCTA id="diy-guide-secondary" secondary={true} />

      {/* 5) FAQs */}
      <FAQ />

      {/* 6) Boroughs / Coverage */}
      <section className="py-12 px-4 bg-slate-900 text-slate-400 text-sm">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="font-bold text-white mb-4 uppercase tracking-wider">Coverage Area</h3>
          <p>
            Serving Greater London including: Camden, Greenwich, Hackney, Hammersmith and Fulham, Islington, Kensington
            and Chelsea, Lambeth, Lewisham, Southwark, Tower Hamlets, Wandsworth, Westminster, Barking and Dagenham,
            Barnet, Bexley, Brent, Bromley, Croydon, Ealing, Enfield, Haringey, Harrow, Havering, Hillingdon, Hounslow,
            Kingston upon Thames, Merton, Newham, Redbridge, Richmond upon Thames, Sutton, Waltham Forest.
          </p>
        </div>
      </section>
    </main>
  );
}
