// scripts/buildProvidersFromListings.mjs
// Build canonical providers from raw multi-source listings (NO INFERENCE).
// Usage:
//   node scripts/buildProvidersFromListings.mjs
//
// Expects:
//   data/listings_london_v1.json
// Writes:
//   data/providers_london_v1.json
//   data/providers_london_v1.build_report.json

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const IN_PATH = path.join(ROOT, "data", "listings_london_v1.json");
const OUT_PATH = path.join(ROOT, "data", "providers_london_v1.json");
const REPORT_PATH = path.join(ROOT, "data", "providers_london_v1.build_report.json");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function normStr(v) {
  if (v === undefined || v === null) return "";
  const s = String(v).trim();
  return s;
}

function normLower(v) {
  return normStr(v).toLowerCase();
}

function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function pickFirstNonEmpty(existing, candidate) {
  const a = normStr(existing);
  const b = normStr(candidate);
  if (a) return a;
  if (b) return b;
  return "";
}

function mergeTriState(existing, candidate) {
  // candidate must be explicitly true/false to be used. Otherwise ignore.
  if (candidate === true) return true;
  if (candidate === false) return false;
  return existing ?? null;
}

function mergeFieldWithConflict(provider, field, candidateRaw, conflicts) {
  const candidate = normStr(candidateRaw);
  if (!candidate) return;

  const current = normStr(provider[field]);
  if (!current) {
    provider[field] = candidate;
    return;
  }
  if (current !== candidate) {
    conflicts[field] = conflicts[field] || uniq([current]);
    conflicts[field] = uniq([...conflicts[field], candidate]);
  }
}

function main() {
  if (!fs.existsSync(IN_PATH)) {
    console.error(`Missing input file: ${IN_PATH}`);
    process.exit(1);
  }

  const listings = readJson(IN_PATH);
  if (!Array.isArray(listings)) {
    console.error("Input must be an array of listings.");
    process.exit(1);
  }

  const byId = new Map();

  const report = {
    input_listings: listings.length,
    providers_built: 0,
    missing_canonical_id: 0,
    conflicts: {
      phone: 0,
      website: 0,
      email: 0,
      name: 0,
    },
    providers_with_any_conflict: 0,
  };

  for (const row of listings) {
    const canonical_id = normStr(row?.canonical_id);
    if (!canonical_id) {
      report.missing_canonical_id += 1;
      continue;
    }

    const key = canonical_id; // keep as string, immutable

    if (!byId.has(key)) {
      byId.set(key, {
        canonical_id: key,
        name: "",            // best available display name (non-inferred)
        slug: "",            // optional: only if provided in listings
        phone: "",
        website: "",
        email: "",
        address: "",         // optional: only if provided
        postcode: "",        // optional: only if provided
        borough: "",         // optional: only if provided
        serves_london: null, // tri-state
        residential: null,   // tri-state
        commercial: null,    // tri-state
        emergency_callout: null, // tri-state
        pests_supported: [],
        sources: [],
        profile_text: "",
        // build metadata (non-user-facing)
        _build: {
          listings_count: 0,
          conflicts: {}, // field -> [values...]
        },
      });
    }

    const p = byId.get(key);
    p._build.listings_count += 1;

    // Sources
    const src = normStr(row?.source);
    if (src) p.sources.push(src);

    // Name: pick first non-empty; track conflict if differing
    const candName = normStr(row?.name || row?.provider_name || row?.business_name);
    if (candName) {
      const current = normStr(p.name);
      if (!current) p.name = candName;
      else if (current !== candName) {
        p._build.conflicts.name = uniq([...(p._build.conflicts.name || [current]), candName]);
      }
    }

    // Optional slug if present
    const candSlug = normStr(row?.slug);
    if (!p.slug && candSlug) p.slug = candSlug;

    // Contact fields with conflict capture
    mergeFieldWithConflict(p, "phone", row?.phone, p._build.conflicts);
    mergeFieldWithConflict(p, "website", row?.website, p._build.conflicts);
    mergeFieldWithConflict(p, "email", row?.email, p._build.conflicts);

    // Optional location fields (only if present)
    p.address = pickFirstNonEmpty(p.address, row?.address);
    p.postcode = pickFirstNonEmpty(p.postcode, row?.postcode);
    p.borough = pickFirstNonEmpty(p.borough, row?.borough);

    // Tri-state booleans: only take explicit true/false from listing rows
    p.serves_london = mergeTriState(p.serves_london, row?.serves_london);
    p.residential = mergeTriState(p.residential, row?.residential);
    p.commercial = mergeTriState(p.commercial, row?.commercial);
    p.emergency_callout = mergeTriState(p.emergency_callout, row?.emergency_callout);

    // Pests: union; accept either array or comma-separated string
    const pests = row?.pests_supported;
    if (Array.isArray(pests)) {
      p.pests_supported.push(...pests.map(normStr).filter(Boolean));
    } else if (typeof pests === "string") {
      p.pests_supported.push(
        ...pests.split(",").map(s => s.trim()).filter(Boolean)
      );
    }

    // Profile text: keep the longest non-empty text we’ve seen (no inference)
    const txt = normStr(row?.profile_text || row?.description || row?.about);
    if (txt && txt.length > (p.profile_text?.length || 0)) {
      p.profile_text = txt;
    }
  }

  // Finalize providers array
  const providers = [];
  for (const p of byId.values()) {
    p.sources = uniq(p.sources);
    p.pests_supported = uniq(p.pests_supported);

    // Normalize empties to nulls for clean downstream logic
    const toNull = (v) => (normStr(v) ? v : null);
    p.name = toNull(p.name);
    p.slug = toNull(p.slug);
    p.phone = toNull(p.phone);
    p.website = toNull(p.website);
    p.email = toNull(p.email);
    p.address = toNull(p.address);
    p.postcode = toNull(p.postcode);
    p.borough = toNull(p.borough);
    p.profile_text = toNull(p.profile_text);

    // Count conflicts
    const c = p._build.conflicts || {};
    const hasAnyConflict = Object.keys(c).length > 0;
    if (hasAnyConflict) report.providers_with_any_conflict += 1;
    if (c.phone) report.conflicts.phone += 1;
    if (c.website) report.conflicts.website += 1;
    if (c.email) report.conflicts.email += 1;
    if (c.name) report.conflicts.name += 1;

    providers.push(p);
  }

  // Deterministic order (string compare to avoid numeric coercion surprises)
  providers.sort((a, b) => String(a.canonical_id).localeCompare(String(b.canonical_id)));

  report.providers_built = providers.length;

  writeJson(OUT_PATH, providers);
  writeJson(REPORT_PATH, report);

  console.log(`OK: built ${providers.length} providers`);
  console.log(`Wrote: ${OUT_PATH}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main();
