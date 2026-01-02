'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Counts = Record<string, number>;

export default function FilterBar({ counts }: { counts: Counts }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setQ(searchParams.get('q') || '');
  }, [searchParams]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const v = value.trim();

      if (v) params.set(name, v);
      else params.delete(name);

      return params.toString();
    },
    [searchParams]
  );

  const pushParams = useCallback(
    (name: string, value: string) => {
      const qs = createQueryString(name, value);
      router.push(qs ? `?${qs}` : '?', { scroll: false });
    },
    [createQueryString, router]
  );

  // Debounced search => updates q param
  useEffect(() => {
    const t = setTimeout(() => pushParams('q', q), 250);
    return () => clearTimeout(t);
  }, [q, pushParams]);

  const setSelect = (name: string, value: string) => pushParams(name, value);
  const setCheck = (name: string, checked: boolean) => pushParams(name, checked ? 'true' : '');

  const hasActiveFilters = useMemo(() => {
    return searchParams.toString().length > 0;
  }, [searchParams]);

  const clearAll = () => router.push('?', { scroll: false });

  const count = (key: string) => counts?.[key] ?? 0;
  const disabled = (key: string) => count(key) === 0;

  const Check = ({
    name,
    label,
    tooltip,
  }: {
    name: string;
    label: string;
    tooltip: string;
  }) => (
    <label className={`flex items-start gap-2 ${disabled(name) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        className="mt-1 rounded border-slate-300"
        checked={searchParams.get(name) === 'true'}
        onChange={(e) => setCheck(name, e.target.checked)}
        disabled={disabled(name)}
      />
      <span className="text-sm text-slate-700">
        {label}{' '}
        <span className="text-slate-400" title={tooltip}>
          ({count(name)})
        </span>
      </span>
    </label>
  );

  const Section = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
      <div className="grid gap-2 md:grid-cols-2">{children}</div>
    </div>
  );

  return (
    <div className="space-y-4 mb-8">
      {/* Core spine (always available) */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-4 md:space-y-0 md:flex md:gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Search provider</label>
          <input
            type="text"
            placeholder="Type a provider name…"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="w-full md:w-52">
          <label className="block text-sm font-medium text-slate-700 mb-1">Pest type</label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            onChange={(e) => setSelect('pest', e.target.value)}
            value={searchParams.get('pest') || ''}
          >
            <option value="">All pests</option>
            <option value="rats">Rats</option>
            <option value="mice">Mice</option>
            <option value="bed bugs">Bed bugs</option>
            <option value="wasps">Wasps</option>
            <option value="ants">Ants</option>
            <option value="cockroaches">Cockroaches</option>
            <option value="fleas">Fleas</option>
            <option value="moths">Moths</option>
            <option value="squirrels">Squirrels</option>
          </select>
        </div>

        <div className="w-full md:w-44">
          <label className="block text-sm font-medium text-slate-700 mb-1">Service type</label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            onChange={(e) => setSelect('type', e.target.value)}
            value={searchParams.get('type') || ''}
          >
            <option value="">Any</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        <div className="w-full md:w-auto pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-slate-300"
              onChange={(e) => setCheck('emergency', e.target.checked)}
              checked={searchParams.get('emergency') === 'true'}
            />
            <span className="text-sm text-slate-700">Emergency call-out</span>
          </label>
        </div>

        <div className="w-full md:w-auto md:pb-2 flex justify-end">
          <button
            type="button"
            onClick={clearAll}
            className={`text-sm px-3 py-2 rounded-md border ${
              hasActiveFilters
                ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
                : 'border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            disabled={!hasActiveFilters}
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Expanded groups 1–7 */}
      <Section
        title="Contact & availability"
        subtitle="Based on contact details listed by the provider."
      >
        <Check name="has_phone" label="Has phone number" tooltip="Provider has a phone number listed." />
        <Check name="has_website" label="Has website" tooltip="Provider has a website listed." />
        <Check name="has_email" label="Has email" tooltip="Provider has an email address listed." />
        <Check name="has_any_contact" label="Has any contact method" tooltip="Phone, website, or email is listed." />
      </Section>

      <Section
        title="Location details"
        subtitle="Shows whether location details are provided, not service coverage."
      >
        <Check name="has_postcode" label="Postcode listed" tooltip="Provider has a postcode listed." />
        <Check name="has_address" label="Address listed" tooltip="Provider has an address listed." />
      </Section>

      <Section
        title="Services offered (listed)"
        subtitle="Based on services listed by the provider. This does not guarantee outcomes."
      >
        <Check name="both_services" label="Residential + commercial" tooltip="Provider lists both residential and commercial services." />
        <Check name="specialist_pests" label="Specialist pests handled" tooltip="Provider lists bed bugs/cockroaches or a broad scope of pests." />
      </Section>

      <Section
        title="Treatment approach"
        subtitle="Based on provider descriptions. Terms and costs vary by provider."
      >
        <Check name="mentions_follow_up" label="Mentions follow-up visits" tooltip="Provider mentions follow-up/return visits/re-treatments." />
      </Section>

      <Section
        title="Pricing information"
        subtitle="Based on pricing information mentioned by the provider. Actual costs vary."
      >
        <Check name="mentions_pricing" label="Mentions pricing information" tooltip="Provider mentions pricing/costs/rates in their description." />
        <Check name="mentions_callout_fee" label="Mentions call-out fee" tooltip="Provider mentions a call-out fee in their description." />
        <Check name="mentions_free_quote" label="Mentions free quote/inspection" tooltip="Provider mentions free quote/inspection/no-obligation quote." />
      </Section>

      <Section
        title="Business details"
        subtitle="Based on the level of detail provided by the business."
      >
        <Check name="multiple_contact_methods" label="Multiple contact methods" tooltip="Provider lists at least two of phone/website/email." />
        <Check name="phone_and_website" label="Phone + website" tooltip="Provider lists both a phone number and a website." />
        <Check name="email_domain_present" label="Email domain present" tooltip="Email is non-generic (not Gmail/Outlook/etc.)." />
      </Section>

      <Section
        title="Listings & associations"
        subtitle="Based on where the business appears online."
      >
        <Check name="association_listed" label="Association-listed" tooltip="Listed in BPCA or NPTA (requires sources data)." />
        <Check name="multi_source" label="Listed in multiple sources" tooltip="Appears in 2+ sources (requires sources data)." />
      </Section>
    </div>
  );
}
