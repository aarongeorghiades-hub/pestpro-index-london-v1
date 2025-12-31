import { Provider } from '@/lib/data';
import ProviderCard from './ProviderCard';

export default function ProviderList({ providers }: { providers: Provider[] }) {
  if (providers.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-slate-500">No providers found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {providers.map(provider => (
        <ProviderCard key={provider.canonical_id} provider={provider} />
      ))}
    </div>
  );
}
