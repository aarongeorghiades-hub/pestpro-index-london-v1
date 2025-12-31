import { getProviderBySlug, getAllProviders } from '@/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Phone, Globe, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ providerSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { providerSlug } = await params;
  const provider = getProviderBySlug(providerSlug);
  
  if (!provider) {
    return { title: 'Provider Not Found' };
  }

  return {
    title: `${provider.name} - Pest Control London | PestPro Index`,
    description: `Contact details and services for ${provider.name}. Serving London for ${provider.pests_supported?.join(', ') || 'pest control'}.`,
  };
}

export async function generateStaticParams() {
  const providers = getAllProviders();
  return providers.map((provider) => ({
    providerSlug: provider.slug,
  }));
}

export default async function ProviderPage({ params }: Props) {
  const { providerSlug } = await params;
  const provider = getProviderBySlug(providerSlug);

  if (!provider) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link href="/london/pest-control" className="text-blue-600 hover:underline mb-6 inline-block">
          &larr; Back to Directory
        </Link>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-900 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{provider.name}</h1>
            <div className="flex flex-wrap gap-3 mt-4">
              {provider.residential && (
                <span className="bg-green-500/20 text-green-100 border border-green-500/30 px-3 py-1 rounded-full text-sm font-medium">
                  Residential
                </span>
              )}
              {provider.commercial && (
                <span className="bg-blue-500/20 text-blue-100 border border-blue-500/30 px-3 py-1 rounded-full text-sm font-medium">
                  Commercial
                </span>
              )}
              {provider.emergency_callout && (
                <span className="bg-red-500/20 text-red-100 border border-red-500/30 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> 24/7 Emergency
                </span>
              )}
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Contact Info */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">Contact Details</h2>
              <div className="space-y-4">
                {provider.phone ? (
                  <div className="flex items-center gap-3 text-lg">
                    <div className="bg-slate-100 p-2 rounded-full">
                      <Phone className="w-5 h-5 text-slate-600" />
                    </div>
                    <span className="font-medium">{provider.phone}</span>
                  </div>
                ) : (
                  <div className="text-slate-400 italic">Phone number not available</div>
                )}

                {provider.website ? (
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-full">
                      <Globe className="w-5 h-5 text-slate-600" />
                    </div>
                    <a 
                      href={provider.website} 
                      target="_blank" 
                      rel="nofollow noreferrer" 
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Visit Website
                    </a>
                  </div>
                ) : (
                  <div className="text-slate-400 italic">Website not available</div>
                )}

                {(provider.address || provider.postcode) ? (
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-full">
                      <MapPin className="w-5 h-5 text-slate-600" />
                    </div>
                    <span>
                      {[provider.address, provider.postcode].filter(Boolean).join(', ')}
                    </span>
                  </div>
                ) : (
                  <div className="text-slate-400 italic">Address not available</div>
                )}
              </div>
            </section>

            {/* Services */}
            {provider.pests_supported && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">Pests Controlled</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {provider.pests_supported.map(pest => (
                    <div key={pest} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="capitalize">{pest}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
