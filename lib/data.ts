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

  // Optional enrichment fields (may not exist yet in your JSON; safe to leave null/undefined)
  sources?: string[] | null;        // e.g. ["BPCA","NPTA","Yell"]
  profile_text?: string | null;     // short provider description / extracted copy
}

const dataDirectory = path.join(process.cwd(), 'data');

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents) as T;
  } catch {
    return fallback;
  }
}

// Normalise pest strings so filters match reliably (no inference; just consistent formatting)
export function normalizePest(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ');
}

export function getAllProviders(): Provider[] {
  const filePath = path.join(dataDirectory, 'providers_london_v1.json');
  const providers = readJsonFile<Provider[]>(filePath, []);
  return providers.filter((p) => p.serves_london);
}

/**
 * Featured providers for the London overview page.
 *
 * Rules (deterministic, no inference):
 * - Primary source of "featured" is data/featured_provider_ids.json.
 * - Returned order respects the order of IDs in that JSON.
 * - We cap at `limit` (default 8).
 * - If fewer than `limit` IDs are present/match, we fill remaining slots with a stable preview set:
 *   remaining providers sorted by canonical_id (ascending), excluding already-selected.
 */
export function getFeaturedProviders(limit: number = 8): Provider[] {
  const allProviders = getAllProviders();
  const featuredPath = path.join(dataDirectory, 'featured_provider_ids.json');

  const featuredIds = readJsonFile<string[]>(featuredPath, []).filter(Boolean);

  const byId = new Map(allProviders.map((p) => [p.canonical_id, p] as const));

  const explicitFeatured: Provider[] = [];
  for (const id of featuredIds) {
    const p = byId.get(id);
    if (p) explicitFeatured.push(p);
    if (explicitFeatured.length >= limit) break;
  }

  if (explicitFeatured.length >= limit) return explicitFeatured.slice(0, limit);

  const selected = new Set(explicitFeatured.map((p) => p.canonical_id));
  const fillers = allProviders
    .filter((p) => !selected.has(p.canonical_id))
    .slice()
    .sort((a, b) => a.canonical_id.localeCompare(b.canonical_id));

  const needed = limit - explicitFeatured.length;
  return explicitFeatured.concat(fillers.slice(0, needed));
}

export function getProviderBySlug(slug: string): Provider | undefined {
  const allProviders = getAllProviders();
  return allProviders.find((p) => p.slug === slug);
}

export function getProvidersByPest(pestSlug: string): Provider[] {
  const allProviders = getAllProviders();
  const pestName = normalizePest(pestSlug);

  return allProviders.filter((p) => {
    const pests = Array.isArray(p.pests_supported) ? p.pests_supported : [];
    return pests.map(normalizePest).includes(pestName);
  });
}
