'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Counts = Record<string, number>;

export default function FilterBar({ counts }: { counts: Counts }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const get = (k: string) => searchParams.get(k) || '';

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(name, value);
      else params.delete(name);
      return params.toString();
    },
    [searchParams]
  );

  const setParam = (name: string, value: string) => {
    router.push(`?${createQueryString(name, value)}`, { scroll: false });
  };

  const toggleBool = (name: string, on: boolean) => {
    setParam(name, on ? 'true' : '');
  };

  const clearAll = () => {
    router.push(`/london/pest-control`, { scroll: false });
  };

  const boolChecked = (name: string) => get(name) === 'true';
  const hasCount = (name: string) => (counts?.[name] || 0) > 0;

  const sourceOptions = useMemo(
    () => [
      { value: '', label: 'Any source' },
      { value: 'BPCA', label: 'BPCA' },
      { value: 'NPTA', label: 'NPTA' },
      { value: 'COUNCIL', label: 'Council' },
      { value: 'COMPANY_WEBSITE', label: 'Company website' },
    ],
    []
  );

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 mb-8 space-y-6">
      {/* Top spine */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Search provider</label>
          <input
            type="text"
            placeholder="Type a provider name..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            defaultValue={get('q')}
            onChange={(e) => setParam('q', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pest type</label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            value={get('pest')}
            onChange={(e) => setParam('pest', e.target.value)}
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

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Service type</label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            value={get('type')}
            onChange={(e) => setParam('type', e.target.value)}
          >
            <option value="">Any</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        <div className="flex gap-3 items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
            <input
              type="checkbox"
              className="rounded border-slate-300"
              checked={boolChecked('emergency')}
              onChange={(e) => toggleBool('emergency', e.target.checked)}
            />
            Emergency call-out
          </label>

          <button
            type="button"
            onClick={clearAll}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Source */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Listing source</label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            value={get('source')}
            onChange={(e) => setParam('source', e.target.value)}
          >
            {sourceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">Shows where this listing appears online.</p>
        </div>
      </div>

      {/* Expanded filters (Groups 1–7) */}
      <div className="space-y-4">
        <Section title="Contact availability" subtitle="Filters based on what contact details are provided.">
          <Check name="has_phone" label={`Phone listed (${counts.has_phone || 0})`} disabled={!hasCount('has_phone')} checked={boolChecked('has_phone')} onToggle={toggleBool} />
          <Check name="has_website" label={`Website listed (${counts.has_website || 0})`} disabled={!hasCount('has_website')} checked={boolChecked('has_website')} onToggle={toggleBool} />
          <Check name="has_email" label={`Email listed (${counts.has_email || 0})`} disabled={!hasCount('has_email')} checked={boolChecked('has_email')} onToggle={toggleBool} />
          <Check name="has_any_contact" label={`Any contact method (${counts.has_any_contact || 0})`} disabled={!hasCount('has_any_contact')} checked={boolChecked('has_any_contact')} onToggle={toggleBool} />
        </Section>

        <Section title="Location details" subtitle="Shows whether location details are provided (not service coverage).">
          <Check name="has_postcode" label={`Postcode listed (${counts.has_postcode || 0})`} disabled={!hasCount('has_postcode')} checked={boolChecked('has_postcode')} onToggle={toggleBool} />
          <Check name="has_address" label={`Address listed (${counts.has_address || 0})`} disabled={!hasCount('has_address')} checked={boolChecked('has_address')} onToggle={toggleBool} />
        </Section>

        <Section title="Services offered (listed)" subtitle="Based on services explicitly listed.">
          <Check name="both_services" label={`Residential + commercial (${counts.both_services || 0})`} disabled={!hasCount('both_services')} checked={boolChecked('both_services')} onToggle={toggleBool} />
          <Check name="specialist_pests" label={`Specialist pests handled (${counts.specialist_pests || 0})`} disabled={!hasCount('specialist_pests')} checked={boolChecked('specialist_pests')} onToggle={toggleBool} />
        </Section>

        <Section title="Treatment approach" subtitle="Based on text where available.">
          <Check
            name="mentions_follow_up"
            label={`Mentions return visits (${counts.mentions_follow_up || 0})`}
            disabled={!hasCount('mentions_follow_up')}
            checked={boolChecked('mentions_follow_up')}
            onToggle={toggleBool}
          />
        </Section>

        <Section title="Pricing information" subtitle="Based on pricing information mentioned by the business (where available).">
          <Check name="mentions_pricing" label={`Mentions pricing info (${counts.mentions_pricing || 0})`} disabled={!hasCount('mentions_pricing')} checked={boolChecked('mentions_pricing')} onToggle={toggleBool} />
          <Check name="mentions_callout_fee" label={`Mentions call-out fee (${counts.mentions_callout_fee || 0})`} disabled={!hasCount('mentions_callout_fee')} checked={boolChecked('mentions_callout_fee')} onToggle={toggleBool} />
          <Check name="mentions_free_quote" label={`Mentions free quote/inspection (${counts.mentions_free_quote || 0})`} disabled={!hasCount('mentions_free_quote')} checked={boolChecked('mentions_free_quote')} onToggle={toggleBool} />
        </Section>

        <Section title="Business details" subtitle="Based on the level of detail provided.">
          <Check name="multiple_contact_methods" label={`Multiple contact methods (${counts.multiple_contact_methods || 0})`} disabled={!hasCount('multiple_contact_methods')} checked={boolChecked('multiple_contact_methods')} onToggle={toggleBool} />
          <Check name="phone_and_website" label={`Phone + website (${counts.phone_and_website || 0})`} disabled={!hasCount('phone_and_website')} checked={boolChecked('phone_and_website')} onToggle={toggleBool} />
          <Check name="email_domain_present" label={`Email domain present (${counts.email_domain_present || 0})`} disabled={!hasCount('email_domain_present')} checked={boolChecked('email_domain_present')} onToggle={toggleBool} />
        </Section>

        <Section title="Listings & associations" subtitle="Based on where the business appears online (source-based, no scoring).">
          <Check name="association_listed" label={`Association-listed (${counts.association_listed || 0})`} disabled={!hasCount('association_listed')} checked={boolChecked('association_listed')} onToggle={toggleBool} />
          <Check name="multi_source" label={`Listed in multiple sources (${counts.multi_source || 0})`} disabled={!hasCount('multi_source')} checked={boolChecked('multi_source')} onToggle={toggleBool} />
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <div className="mb-3">
        <div className="font-semibold text-slate-900">{title}</div>
        {subtitle ? <div className="text-sm text-slate-500">{subtitle}</div> : null}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Check({
  name,
  label,
  checked,
  disabled,
  onToggle,
}: {
  name: string;
  label: string;
  checked: boolean;
  disabled: boolean;
  onToggle: (name: string, on: boolean) => void;
}) {
  return (
    <label className={`flex items-center gap-2 text-sm ${disabled ? 'text-slate-400' : 'text-slate-700'} cursor-pointer`}>
      <input
        type="checkbox"
        className="rounded border-slate-300"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onToggle(name, e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
