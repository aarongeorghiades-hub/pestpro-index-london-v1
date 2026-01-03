import { getDirectoryProviders } from '@/lib/data';
import ProviderList from '@/components/ProviderList';
import FilterBar from '@/components/FilterBar';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function asBool(v: unknown): boolean {
  return v === 'true';
}

function asStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function normalizeText(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function emailHasNonGenericDomain(email: string | null): boolean {
  if (!email) return false;
  const at = email.lastIndexOf('@');
  if (at === -1) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();

  // Keep this simple and defensible
  const generic = new Set([
    'gmail.com',
    'googlemail.com',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'icloud.com',
    'yahoo.com',
    'yahoo.co.uk',
    'aol.com',
    'proton.me',
    'protonmail.com',
  ]);

  return domain.length > 0 && !generic.has(domain);
}

function providerSignals(p: Provider) {
  const has_phone = Boolean(p.phone && p.phone.trim());
  const has_website = Boolean(p.website && p.website.trim());
  const has_email = Boolean(p.email && p.email.trim());
  const has_any_contact = has_phone || has_website || has_email;

  const has_postcode = Boolean(p.postcode && p.postcode.trim());
  const has_address = Boolean(p.address && p.address.trim());

  const residential = p.residential === true;
  const commercial = p.commercial === true;
  const both_services = residential && commercial;

  const pests = Array.isArray(p.pests_supported) ? p.pests_supported : [];
  const pestsNorm = pests.map(normalizePest);

  // Specialist pests: explicit list OR breadth (no quality inference, just scope)
  const hasBedBugs = pestsNorm.includes('bed bugs');
  const hasCockroaches = pestsNorm.includes('cockroaches');
  const specialist_pests = hasBedBugs || hasCockroaches || pestsNorm.length >= 5;

  const multiple_contact_methods = [has_phone, has_website, has_email].filter(Boolean).length >= 2;
  const phone_and_website = has_phone && has_website;
  const email_domain_present = emailHasNonGenericDomain(p.email);

  // Follow-up & pricing signals rely on explicit profile_text (if available)
  const text = normalizeText(p.profile_text || '');
  const mentions_follow_up =
    Boolean(text) &&
    (text.includes('follow up') ||
      text.includes('follow-up') ||
      text.includes('followup') ||
      text.includes('return visit') ||
      text.includes('re-treatment') ||
      text.includes('retreatment') ||
      text.includes('repeat treatment') ||
      text.includes('follow up visit') ||
      text.includes('follow-up visit'));

  const mentions_pricing =
    Boolean(text) &&
    (text.includes('price') ||
      text.includes('pricing') ||
      text.includes('from £') ||
      text.includes('from£') ||
      text.includes('cost') ||
      text.includes('rates'));

  const mentions_callout_fee =
    Boolean(text) &&
    (text.includes('call-out fee') ||
      text.includes('call out fee') ||
      text.includes('callout fee'));

  const mentions_free_quote =
    Boolean(text) &&
    (text.includes('free quote') ||
      text.includes('free quotation') ||
      text.includes('free inspection') ||
      text.includes('no obligation quote') ||
      text.includes('no-obligation quote'));

  // Listings & associations rely on explicit sources[] (if available)
  const sources = Array.isArray(p.sources) ? p.sources : [];
  const sourcesNorm = sources.map((s) => s.toUpperCase().trim()).filter(Boolean);
  const association_listed = sourcesNorm.includes('BPCA') || sourcesNorm.includes('NPTA');
  const multi_source = sourcesNorm.length >= 2;

  return {
    // Group 1
    has_phone,
    has_website,
    has_email,
    has_any_contact,
    emergency_callout: p.emergency_callout === true,

    // Group 2
    has_postcode,
    has_address,

    // Group 3
    residential,
    commercial,
    both_services,
    specialist_pests,

    // Group 4
    mentions_follow_up,

    // Group 5
    mentions_pricing,
    mentions_callout_fee,
    mentions_free_quote,

    // Group 6
    multiple_contact_methods,
    phone_and_website,
    email_domain_present,

    // Group 7
    association_listed,
    multi_source,
  };
}

type SignalKey = keyof ReturnType<typeof providerSignals>;

function countSignals(providers: Provider[]) {
  const counts: Record<string, number> = {};
  for (const p of providers) {
    const s = providerSignals(p);
    for (const [k, v] of Object.entries(s)) {
      if (v) counts[k] = (counts[k] || 0) + 1;
    }
  }
  return counts as Record<SignalKey, number>;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;

  // Any active filter => noindex (canonical remains /london/pest-control)
  const hasAny =
    Boolean(asStr(params.q) || asStr(params.pest) || asStr(params.type)) ||
    asBool(params.emergency) ||
    asBool(params.has_phone) ||
    asBool(params.has_website) ||
    asBool(params.has_email) ||
    asBool(params.has_any_contact) ||
    asBool(params.has_postcode) ||
    asBool(params.has_address) ||
    asBool(params.both_services) ||
    asBool(params.specialist_pests) ||
    asBool(params.mentions_follow_up) ||
    asBool(params.mentions_pricing) ||
    asBool(params.mentions_callout_fee) ||
    asBool(params.mentions_free_quote) ||
    asBool(params.multiple_contact_methods) ||
    asBool(params.phone_and_website) ||
    asBool(params.email_domain_present) ||
    asBool(params.association_listed) ||
    asBool(params.multi_source);

  return {
    title: 'All Pest Control Providers London | PestPro Index',
    description:
      'Browse the London pest control directory. Filter by need, then contact providers directly.',
    alternates: { canonical: '/london/pest-control' },
    robots: hasAny ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function PestControlPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const allProviders = getAllProviders();

  // Counts to drive UI (disable filters that would return 0)
  const signalCounts = countSignals(allProviders);

  // Apply filters
  let filtered = allProviders;

  // Existing filters
  const q = asStr(params.q).toLowerCase();
  if (q) {
    filtered = filtered.filter((p) => (p.name || '').toLowerCase().includes(q));
  }

  const pest = normalizePest(asStr(params.pest).toLowerCase());
  if (pest) {
    filtered = filtered.filter((p) => {
      const pests = Array.isArray(p.pests_supported) ? p.pests_supported : [];
      return pests.map(normalizePest).includes(pest);
    });
  }

  const type = asStr(params.type);
  if (type === 'residential') filtered = filtered.filter((p) => p.residential === true);
  if (type === 'commercial') filtered = filtered.filter((p) => p.commercial === true);

  if (asBool(params.emergency)) filtered = filtered.filter((p) => p.emergency_callout === true);

  // Expanded filters: computed signals
  const applySignal = (key: SignalKey) => {
    if (asBool((params as any)[key])) {
      filtered = filtered.filter((p) => providerSignals(p)[key] === true);
    }
  };

  // Group 1
  applySignal('has_phone');
  applySignal('has_website');
  applySignal('has_email');
  applySignal('has_any_contact');

  // Group 2
  applySignal('has_postcode');
  applySignal('has_address');

  // Group 3
  applySignal('both_services');
  applySignal('specialist_pests');

  // Group 4
  applySignal('mentions_follow_up');

  // Group 5
  applySignal('mentions_pricing');
  applySignal('mentions_callout_fee');
  applySignal('mentions_free_quote');

  // Group 6
  applySignal('multiple_contact_methods');
  applySignal('phone_and_website');
  applySignal('email_domain_present');

  // Group 7
  applySignal('association_listed');
  applySignal('multi_source');

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Link href="/london" className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to London overview
          </Link>

          <h1 className="text-3xl font-bold text-slate-900">London pest control providers</h1>
          <p className="text-slate-600 mt-2">
            Browse {allProviders.length} listed providers serving Greater London. Use filters below, then contact providers directly.
          </p>
        </div>

        <FilterBar counts={signalCounts} />

        <div className="mb-4 text-sm text-slate-500">
          Showing {filtered.length} provider{filtered.length === 1 ? '' : 's'}
        </div>

        <ProviderList providers={filtered} />
      </div>
    </main>
  );
}
