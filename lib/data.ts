import fs from 'fs';
import path from 'path';

export interface Provider {
  canonical_id: string;
  name: string;
  slug: string;
  phone: string | null;
  website: string | null;
  email: string | null;
  address: string | null;
  postcode: string | null;
  serves_london: boolean;
  residential: boolean | null;
  commercial: boolean | null;
  emergency_callout: boolean | null;
  pests_supported: string[] | null;

  // Optional enrichment fields (may be null/absent)
  profile_text?: string | null;
  sources?: string[] | null;
}

export interface Listing extends Provider {
  listing_id: string;
  source: string | null;

  // Listing-level extra fields (may be null)
  company_name?: string | null;
  canonical_name?: string | null;
  borough?: string | null;
  rating?: number | null;
  review_count?: number | null;
  search_area?: string | null;
  profile_url?: string | null;
}

const dataDirectory = path.join(process.cwd(), 'data');

export function normalizePest(s: string): string {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function readJson<T>(fileName: string): T {
  const filePath = path.join(dataDirectory, fileName);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents) as T;
}

/**
 * Canonical provider list (deduped). Used for featured providers and provider pages.
 */
export function getAllProviders(): Provider[] {
  const providers = readJson<Provider[]>('providers_london_v1.json');
  return providers.filter((p) => p.serves_london);
}

/**
 * Provider-level entries (~484). Used for /london/pest-control directory + filters.
 * No inference: only null-coercion and type safety.
 */
export function getDirectoryProviders(): Provider[] {
  const providers = readJson<Provider[]>('providers_london_v1.json');
  return providers
    .filter((p) => p.serves_london)
    .map((p) => ({
      ...p,
      pests_supported: Array.isArray(p.pests_supported) ? p.pests_supported : null,
      residential: p.residential ?? null,
      commercial: p.commercial ?? null,
      emergency_callout: p.emergency_callout ?? null,
      phone: p.phone ?? null,
      website: p.website ?? null,
      email: p.email ?? null,
      address: p.address ?? null,
      postcode: p.postcode ?? null,
    }));
}

/**
 * Listing-level entries (~1,200). This is Option B for the /london/pest-control directory.
 * (We are NOT using this for Option 1 directory, but keeping it for reference / debugging.)
 */
export function getAllListings(): Listing[] {
  const listings = readJson<Listing[]>('listings_london_v1.json');

  // Ensure consistent types & basic safety (no inference; just coercion)
  return listings
    .filter((l) => l.serves_london !== false) // default true if absent
    .map((l) => ({
      ...l,
      name: (l.name || l.canonical_name || l.company_name || 'Unknown').trim(),
      source: l.source ? String(l.source).trim() : null,
      pests_supported: Array.isArray(l.pests_supported) ? l.pests_supported : null,
      residential: l.residential ?? null,
      commercial: l.commercial ?? null,
      emergency_callout: l.emergency_callout ?? null,
      phone: l.phone ?? null,
      website: l.website ?? null,
      email: l.email ?? null,
      address: l.address ?? null,
      postcode: l.postcode ?? null,
      rating: typeof l.rating === 'number' ? l.rating : l.rating == null ? null : Number(l.rating),
      review_count:
        typeof l.review_count === 'number'
          ? l.review_count
          : l.review_count == null
          ? null
          : Number(l.review_count),
    }));
}

export function getFeaturedProviders(): Provider[] {
  const allProviders = getAllProviders();
  const featuredPath = path.join(dataDirectory, 'featured_provider_ids.json');

  let featuredIds: string[] = [];
  try {
    const fileContents = fs.readFileSync(featuredPath, 'utf8');
    featuredIds = JSON.parse(fileContents);
  } catch (e) {
    // Fallback if file doesn't exist
    return allProviders.slice(0, 8);
  }

  // Keep order deterministic by featured_ids.json order
  const byId = new Map(allProviders.map((p) => [p.canonical_id, p]));
  const featured: Provider[] = [];
  for (const id of featuredIds) {
    const p = byId.get(id);
    if (p) featured.push(p);
    if (featured.length >= 8) break;
  }
  return featured;
}

export function getProviderBySlug(slug: string): Provider | undefined {
  const allProviders = getAllProviders();
  return allProviders.find((p) => p.slug === slug);
}

export function getProvidersByPest(pestSlug: string): Provider[] {
  const allProviders = getAllProviders();
  const pestName = pestSlug.replace(/-/g, ' ');
  const target = normalizePest(pestName);
  return allProviders.filter((p) => {
    const pests = Array.isArray(p.pests_supported) ? p.pests_supported : [];
    return pests.map(normalizePest).includes(target);
  });
}
