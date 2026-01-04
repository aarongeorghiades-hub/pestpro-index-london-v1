import fs from "fs";
import path from "path";

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf8");
}

function asArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === "string") return [v];
  return [];
}

function pickFirstNonEmpty(values) {
  for (const v of values) {
    if (v === null || v === undefined) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    return v;
  }
  return null;
}

function longestText(values) {
  let best = "";
  for (const v of values) {
    if (!v || typeof v !== "string") continue;
    const t = v.trim();
    if (t.length > best.length) best = t;
  }
  return best || null;
}

function normalizePest(p) {
  if (!p || typeof p !== "string") return null;
  return p.trim().toLowerCase();
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function main() {
  const root = process.cwd();

  const listingsPath = path.join(root, "data", "listings_london_v1.json");
  const outPath = path.join(root, "data", "providers_london_v1.json");

  if (!fs.existsSync(listingsPath)) {
    console.error("Missing listings file:", listingsPath);
    process.exit(1);
  }

  const listings = readJson(listingsPath);

  if (!Array.isArray(listings)) {
    console.error("Expected listings_london_v1.json to be an array");
    process.exit(1);
  }

  // Group listings by canonical_id (stringified)
  const byId = new Map();

  for (const row of listings) {
    const rawId = row?.canonical_id ?? row?.canonicalId ?? row?.provider_id;
    if (rawId === null || rawId === undefined) continue;

    const canonical_id = String(rawId);
    if (!byId.has(canonical_id)) byId.set(canonical_id, []);
    byId.get(canonical_id).push(row);
  }

  const providers = [];

  for (const [canonical_id, rows] of byId.entries()) {
    const names = rows.map(r => r?.canonical_name ?? r?.name ?? r?.business_name).filter(Boolean);
    const slugs = rows.map(r => r?.slug).filter(Boolean);

    const phones = rows.map(r => r?.phone ?? r?.phone_number).filter(Boolean);
    const websites = rows.map(r => r?.website ?? r?.url ?? r?.site).filter(Boolean);
    const emails = rows.map(r => r?.email).filter(Boolean);

    const addresses = rows.map(r => r?.address ?? r?.full_address).filter(Boolean);
    const postcodes = rows.map(r => r?.postcode).filter(Boolean);

    const descriptions = rows.map(r => r?.profile_text ?? r?.description ?? r?.about).filter(Boolean);

    // pests: union anything resembling a pests array
    const pests = uniq(
      rows
        .flatMap(r => asArray(r?.pests_supported ?? r?.pests ?? r?.pest_types))
        .map(normalizePest)
        .filter(Boolean)
    );

    // IMPORTANT: No inference.
    // If fields don't exist, keep them null.
    const residential = pickFirstNonEmpty(rows.map(r => r?.residential));
    const commercial = pickFirstNonEmpty(rows.map(r => r?.commercial));
    const emergency_callout = pickFirstNonEmpty(rows.map(r => r?.emergency_callout ?? r?.emergency));

    // sources: keep raw if present, else empty
    const sources = uniq(
      rows
        .flatMap(r => asArray(r?.sources))
        .filter(Boolean)
        .map(s => (typeof s === "string" ? s : JSON.stringify(s)))
    );

    // If any row has boroughs/areas, union them (no inference)
    const boroughs = uniq(
      rows
        .flatMap(r => asArray(r?.boroughs ?? r?.areas ?? r?.locations))
        .filter(Boolean)
        .map(v => (typeof v === "string" ? v.trim() : String(v)))
    );

    const provider = {
      canonical_id,
      name: pickFirstNonEmpty(names) || `Provider ${canonical_id}`,
      slug: pickFirstNonEmpty(slugs) || null,
      phone: pickFirstNonEmpty(phones) || null,
      website: pickFirstNonEmpty(websites) || null,
      email: pickFirstNonEmpty(emails) || null,
      address: pickFirstNonEmpty(addresses) || null,
      postcode: pickFirstNonEmpty(postcodes) || null,

      // London v1 dataset: this site is London-only.
      serves_london: true,

      // may be boolean or null if unknown
      residential: typeof residential === "boolean" ? residential : null,
      commercial: typeof commercial === "boolean" ? commercial : null,
      emergency_callout: typeof emergency_callout === "boolean" ? emergency_callout : null,

      // match interface
      pests_supported: pests.length ? pests : null,

      // optional enrichment
      profile_text: longestText(descriptions),

      boroughs: boroughs.length ? boroughs : null,
      sources: sources.length ? sources : null,
    };

    providers.push(provider);
  }

  // Sort numeric-ish canonical_ids so output is stable
  providers.sort((a, b) => {
    const ai = Number(a.canonical_id);
    const bi = Number(b.canonical_id);
    if (!Number.isNaN(ai) && !Number.isNaN(bi)) return ai - bi;
    return a.canonical_id.localeCompare(b.canonical_id);
  });

  writeJson(outPath, providers);

  console.log(`Generated ${providers.length} providers -> ${outPath}`);
}

main();

