'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Counts = Record<string, number>;

export default function FilterBar({
  counts,
  pestOptions,
}: {
  counts: Counts;
  pestOptions: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const paramsObj = useMemo(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach((v, k) => (obj[k] = v));
    return obj;
  }, [searchParams]);

  const setParam = (key: string, value: string | null) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') p.delete(key);
    else p.set(key, value);
    router.push(`${pathname}?${p.toString()}`);
  };

  const toggleBool = (key: string) => {
    const current = searchParams.get(key);
    const next = current === 'true' ? null : 'true';
    setParam(key, next);
  };

  const clearAll = () => {
    router.push(pathname);
  };

  const isOn = (key: string) => searchParams.get(key) === 'true';
  const count = (key: string) => counts?.[key] ?? 0;

  const textVal = (key: string) => searchParams.get(key) ?? '';

  const pestLabel = (pest: string) => (pest === 'other' ? 'Other (e.g. spiders)' : pest);

  const Check = ({ k, label }: { k: string; label: string }) => (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={isOn(k)}
        onChange={() => toggleBool(k)}
        disabled={count(k) === 0}
      />
      <span>
        {label} <span className="text-slate-400">({count(k)})</span>
      </span>
    </label>
  );

  const fieldClass =
    'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-500';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">Search</div>
            <input
              className={fieldClass}
              placeholder="Provider name…"
              value={textVal('q')}
              onChange={(e) => setParam('q', e.target.value)}
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">Pest</div>
            <select
              className={fieldClass}
              value={textVal('pest')}
              onChange={(e) => setParam('pest', e.target.value)}
            >
              <option value="">All pests</option>
              {(pestOptions ?? []).map((pest) => (
                <option key={pest} value={pest}>
                  {pestLabel(pest)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">Service type</div>
            <select
              className={fieldClass}
              value={textVal('type')}
              onChange={(e) => setParam('type', e.target.value || null)}
            >
              <option value="">Any</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
        </div>

        <button
          onClick={clearAll}
          className="text-sm px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-900"
        >
          Clear filters
        </button>
      </div>

      <div className="mt-4 mb-3 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
        <strong>Note:</strong> Some filters only show results when providers state the detail publicly. 
        A &ldquo;0&rdquo; count can mean &ldquo;not clearly stated&rdquo;, not &ldquo;not offered&rdquo;.
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-2">Contact</div>
          <div className="flex flex-col gap-2">
            <Check k="has_phone" label="Has phone" />
            <Check k="has_website" label="Has website" />
            <Check k="has_email" label="Has email" />
            <Check k="has_any_contact" label="Has any contact" />
            <Check k="emergency" label="Emergency call-out" />
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-500 mb-2">Details</div>
          <div className="flex flex-col gap-2">
            <Check k="has_postcode" label="Has postcode" />
            <Check k="has_address" label="Has address" />
            <Check k="both_services" label="Residential + commercial" />
            <Check k="specialist_pests" label="Specialist pests" />
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-500 mb-2">Extra signals</div>
          <div className="flex flex-col gap-2">
            <Check k="mentions_follow_up" label="Mentions follow-up" />
            <Check k="mentions_pricing" label="Mentions pricing" />
            <Check k="mentions_callout_fee" label="Mentions call-out fee" />
            <Check k="mentions_free_quote" label="Mentions free quote" />
            <Check k="multiple_contact_methods" label="Multiple contact methods" />
            <Check k="phone_and_website" label="Phone + website" />
            <Check k="email_domain_present" label="Non-generic email domain" />
            <Check k="association_listed" label="Listed by BPCA/NPTA" />
            <Check k="multi_source" label="Appears in 2+ sources" />
          </div>
        </div>
      </div>
    </div>
  );
}
