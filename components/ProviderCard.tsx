import { Provider } from '@/lib/data';
import { Phone, Globe, MapPin, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-slate-900">
          <Link href={`/london/pest-control/${provider.slug}`} className="hover:underline">
            {provider.name}
          </Link>
        </h3>
        {provider.emergency_callout && (
          <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            24/7
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm text-slate-600 mb-4">
        {provider.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{provider.phone}</span>
          </div>
        )}
        {provider.website && (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <a href={provider.website} target="_blank" rel="nofollow noreferrer" className="text-blue-600 hover:underline">
              Visit Website
            </a>
          </div>
        )}
        {(provider.address || provider.postcode) && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>
              {[provider.address, provider.postcode].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {provider.residential && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Residential</span>
        )}
        {provider.commercial && (
          <span className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded">Commercial</span>
        )}
      </div>

      {provider.pests_supported && (
        <div className="border-t border-slate-100 pt-3 mt-3">
          <p className="text-xs text-slate-500 mb-2">Pests Covered:</p>
          <div className="flex flex-wrap gap-1">
            {provider.pests_supported.slice(0, 5).map(pest => (
              <span key={pest} className="text-xs bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                {pest}
              </span>
            ))}
            {provider.pests_supported.length > 5 && (
              <span className="text-xs text-slate-400 px-1.5 py-0.5">
                +{provider.pests_supported.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
