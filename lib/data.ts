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
}

const dataDirectory = path.join(process.cwd(), 'data');

export function getAllProviders(): Provider[] {
  const filePath = path.join(dataDirectory, 'providers_london_v1.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const providers: Provider[] = JSON.parse(fileContents);
  return providers.filter(p => p.serves_london);
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
    return allProviders.slice(0, 6);
  }

  return allProviders.filter(p => featuredIds.includes(p.canonical_id));
}

export function getProviderBySlug(slug: string): Provider | undefined {
  const allProviders = getAllProviders();
  return allProviders.find(p => p.slug === slug);
}

export function getProvidersByPest(pestSlug: string): Provider[] {
  const allProviders = getAllProviders();
  // Simple slug matching: "bed-bugs" -> "bed bugs"
  const pestName = pestSlug.replace(/-/g, ' ');
  return allProviders.filter(p => 
    p.pests_supported && p.pests_supported.includes(pestName)
  );
}
