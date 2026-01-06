import { getDirectoryProviders, normalizePest, type Provider } from '@/lib/data';
import ProviderList from '@/components/ProviderList';
import FilterBar from '@/components/FilterBar';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type SearchParams = { [key: string]: string | string[] | undefined };

function asBool(v: unknown): boolean {
  return v === 'true';
}

function asStr(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (Array.isArray(v)) return typeof v[0] === 'string' ? v[0].trim() : '';
  return '';
}

function normalizeText(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function emailHasNonGenericDomain(email: string | null): boolean {
  if (!email) return false;
  const at = email.lastIndexOf('@');
  if (at === -1) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();

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

  const hasBedBugs = pestsNorm.includes('bed bugs');
  const hasCockroaches = pestsNorm.includes('cockroaches');
  const specialist_pests = hasBedBugs || hasCockroaches || pestsNorm.length >= 5;

  const multiple_contact_methods = [has_phone, has_website, has_email].filter(Boolean).length >= 2;
  const phone_and_website = has_phone && has_website;
  const email_domain_present = emailHasNonGenericDomain(p.email);

  const text = normalizeText(p.profile_text || '');
  const mentions_follow_up =
    text.includes('follow up') ||
    text.includes('follow-up') ||
    text.includes('return visit');

  const mentions_pricing =
    text.includes('price') ||
    text.includes('pricing') ||
    text.includes('from £') ||
    text.includes('cost');

  const mentions_callout_fee = text.includes('call-out fee') || text.includes('callout fee');
  const mentions_free_quote = text.includes('free quote') || text.includes('free inspection');

  const sources = Array.isArray(p.sources) ? p.sources : [];
  const sourcesNorm = sources.map((s) => s.toUpperCase().trim()).filter(Boolean);
  const association_listed = sourcesNorm.includes('BPCA') || sourcesNorm.includes('NPTA');
  const multi_source = sourcesNorm.length >= 2;

  return {
    has_phone,
    has_website,
    has_email,
    has_any_contact,
    emergency_callout: p.emergency_callout === true,

    has_postcode,
    has_address,

    residential,
    commercial,
    both_services,
    specialist_pests,

    mentions_follow_up,
    mentions_pricing,
    mentions_callout_fee,
    mentions_free_quote,

    multiple_contact_methods,
    phone_and_website,
    email_domain_present,

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

/**
 * Option B (locked): show a fixed pest list in the dropdown,
 * even if some pests have 0 matches in our data.
 * This avoids a "substandard dropdown" that changes based on scrape completeness.
 */
const PEST_OPTIONS = [
  'rats',
  'mice',
  'bed bugs',
  'cockroaches',
  'ants',
  'fleas',
  'wasps',
  'silverfish',
  'moths',
  'carpet beetles',
  'flies',
  'spiders',
  'birds',
  'squirrels',
] as const;

const PEST_SET = new Set(PEST_OPTIONS.map((p) => normalizePest(p)));

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = searchParams;

  const hasAny =
    Boolean(asStr(params.q) || asStr(params.pest) || asStr(params.type)) ||
    Object.values(params).some((v) => v === 'true');

  return {
    title: 'All Pest Control Providers London | PestPro Index',
    description: 'Browse the London pest control directory. Filter by need, then contact providers directly.',
    alternates: { canonical: '/london/pest-control' },
    robots: hasAny ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function PestControlPage({ searchParams }: { searchParams: SearchParams }) {
  const params = searchParams;
  const allProviders = getDirectoryProviders();

  const pestOptions = [...PEST_OPTIONS, 'other'];

  const signalCounts = countSignals(allProviders);

  let filtered = allProviders;

  const q = asStr(params.q).toLowerCase();
  if (q) filtered = filtered.filter((p) => (p.name || '').toLowerCase().includes(q));

  const pestParamRaw = normalizePest(asStr(params.pest));

  /**
   * Pest filtering rules:
   * - If pest is one of our canonical pests: match providers that explicitly list it.
   * - If pest is "other": match providers with either:
   *    a) no pests_supported at all, OR
   *    b) pests_supported present but none are in our canonical list
   */
  if (pestParamRaw) {
    if (pestParamRaw === 'other') {
      filtered = filtered.filter((p) => {
        const pests = Array.isArray(p.pests_supported) ? p.pests_supported : [];
        if (pests.length === 0) return true;
        const norm = pests.map(normalizePest).filter(Boolean);
        return norm.length > 0 && norm.every((x) => !PEST_SET.has(x));
      });
    } else if (PEST_SET.has(pestParamRaw)) {
      filtered = filtered.filter((p) => {
        const pests = Array.isArray(p.pests_supported) ? p.pests_supported : [];
        return pests.map(normalizePest).includes(pestParamRaw);
      });
    } else {
      // If someone manually types a weird URL param, ignore it rather than "mystery filter".
      // (Dropdown won't produce this anyway.)
    }
  }

  const type = asStr(params.type);
  if (type === 'residential') filtered = filtered.filter((p) => p.residential === true);
  if (type === 'commercial') filtered = filtered.filter((p) => p.commercial === true);

  if (asBool(params.emergency)) filtered = filtered.filter((p) => p.emergency_callout === true);

  const applySignal = (key: SignalKey) => {
    if (asBool((params as any)[key])) {
      filtered = filtered.filter((p) => providerSignals(p)[key] === true);
    }
  };

  Object.keys(providerSignals(allProviders[0] || ({} as Provider))).forEach((k) =>
    applySignal(k as SignalKey)
  );

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Link href="/london" className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to London overview
          </Link>

          <h1 className="text-3xl font-bold text-slate-900">London pest control providers</h1>
          <p className="text-slate-600 mt-2">
            Browse {allProviders.length} listed providers serving Greater London. Use filters below,
            then contact providers directly.
          </p>
        </div>

        <FilterBar counts={signalCounts} pestOptions={pestOptions} />

        <div className="mb-4 text-sm text-slate-500">
          Showing {filtered.length} provider{filtered.length === 1 ? '' : 's'}
        </div>

        <ProviderList providers={filtered} />
      </div>
    </main>
  );
}
