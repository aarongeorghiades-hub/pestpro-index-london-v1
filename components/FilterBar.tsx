'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

type Counts = Record<string, number>;

type Props = {
  counts?: Counts;
};

function asBool(v: string | null): boolean {
  return v === 'true';
}

export default function FilterBar({ counts = {} }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    const qs = createQueryString(name, value);
    router.push(qs ? `?${qs}` : '?', { scroll: false });
  };

  const handleToggle = (name: string, checked: boolean) => {
    handleFilterChange(name, checked ? 'true' : '');
  };

  const clearAll = () => {
    router.push('?', { scroll: false });
  };

  // ---- Preferences (not verified) ----
  const [prefs, setPrefs] = useState({
    returnVisits: false,
    priceTransparency: false,
    freeQuote: false,
    calloutFeeClarity: false,
    eveningWeekend: false,
    discreetService: false,
    writtenReport: false,
  });

  const togglePref = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const selectedPrefQuestions = useMemo(() => {
    const q: string[] = [];
    if (prefs.returnVisits)
      q.push(
        'Do you offer return visits / follow-up re-treatments if activity continues? What are the terms?'
      );
    if (prefs.priceTransparency)
      q.push(
        'Can you explain pricing clearly upfront (typical ranges, what affects cost, and what’s included)?'
      );
    if (prefs.freeQuote)
      q.push(
        'Do you offer a free quote or inspection? If not, what is the charge?'
      );
    if (prefs.calloutFeeClarity)
      q.push('Is there a call-out fee, and is it deducted if I proceed?');
    if (prefs.eveningWeekend)
      q.push('Do you offer evening or weekend appointments, and are there surcharges?');
    if (prefs.discreetService)
      q.push('Can you attend discreetly (unbranded vehicle / minimal signage) if needed?');
    if (prefs.writtenReport)
      q.push('Do you provide a written service report / treatment notes after the visit?');
    return q;
  }, [prefs]);

  // Current values from URL
  const q = searchParams.get('q') || '';
  const pest = searchParams.get('pest') || '';
  const type = searchParams.get('type') || '';
  const emergency = asBool(searchParams.get('emergency'));

  const has_phone = asBool(searchParams.get('has_phone'));
  const has_website = asBool(searchParams.get('has_website'));
  const has_email = asBool(searchParams.get('has_email'));
  const has_any_contact = asBool(searchParams.get('has_any_contact'));

  const has_postcode = asBool(searchParams.get('has_postcode'));
  const has_address = asBool(searchParams.get('has_address'));

  const both_services = asBool(searchParams.get('both_services'));
  const specialist_pests = asBool(searchParams.get('specialist_pests'));

  const anyActive =
    Boolean(q || pest || type) ||
    emergency ||
    has_phone ||
    has_website ||
    has_email ||
    has_any_contact ||
    has_postcode ||
    has_address ||
    both_services ||
    specialist_pests;

  const isDisabled = (key: string) => {
    const c = counts?.[key] ?? 0;
    // If no providers have this signal, disable the checkbox (still shows label)
    return c === 0;
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 mb-8">
      {/* Helper copy */}
      <p className="text-xs text-slate-500 mb-3">
        Filters show factual attributes or detected signals based on published information. Results are not ranked by quality or recommendation.
      </p>

      {/* Top row: primary filters */}
      <div className="space-y-4 md:space-y-0 md:flex md:gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Search name
          </label>
          <input
            type="text"
            placeholder="Provider name..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            onChange={(e) => handleFilterChange('q', e.target.value)}
            defaultValue={q}
          />
        </div>

        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Pest type
          </label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            onChange={(e) => handleFilterChange('pest', e.target.value)}
            defaultValue={pest}
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

        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Service scope (declared)
          </label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            onChange={(e) => handleFilterChange('type', e.target.value)}
            defaultValue={type}
          >
            <option value="">Any</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        <div className="w-full md:w-auto pb-2 flex items-center justify-between md:block">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-slate-300"
              onChange={(e) =>
                handleFilterChange('emergency', e.target.checked ? 'true' : '')
              }
              defaultChecked={emergency}
            />
            <span className="text-sm text-slate-700">
              Emergency call-out (declared)
            </span>
          </label>

          {anyActive && (
            <button
              type="button"
              onClick={clearAll}
              className="ml-3 md:ml-0 md:mt-2 text-xs text-slate-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Signals (data-backed) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Group 1 */}
        <div>
          <div className="text-sm font-semibold text-slate-900 mb-2">
            Contact details available
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                checked={has_phone}
                disabled={isDisabled('has_phone')}
                onChange={(e) => handleToggle('has_phone', e.target.checked)}
              />
              Phone number listed
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                checked={has_website}
                disabled={isDisabled('has_website')}
                onChange={(e) => handleToggle('has_website', e.target.checked)}
              />
              Website listed
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                checked={has_email}
                disabled={isDisabled('has_email')}
                onChange={(e) => handleToggle('has_email', e.target.checked)}
              />
              Email address listed
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                checked={has_any_contact}
                disabled={isDisabled('has_any_contact')}
                onChange={(e) => handleToggle('has_any_contact', e.target.checked)}
              />
              Any contact method listed
            </label>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Based on contact details published by the provider or source.
          </p>
        </div>

        {/* Group 2 */}
        <div>
          <div className="text-sm font-semibold text-slate-900 mb-2">
            Location information listed
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                checked={has_address}
                disabled={isDisabled('has_address')}
                onChange={(e) => handleToggle('has_address', e.target.checked)}
              />
              Address listed
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                checked={has_postcode}
                disabled={isDisabled('has_postcode')}
                onChange={(e) => handleToggle('has_postcode', e.target.checked)}
              />
              Postcode listed
            </label>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Based on published address information. Coverage areas may extend beyond listed locations.
          </p>
        </div>

        {/* Group 3 (extra signals) */}
        <div className="md:col-span-2">
          <div className="text-sm font-semibold text-slate-900 mb-2">
            Service scope (declared)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                checked={both_services}
                disabled={isDisabled('both_services')}
                onChange={(e) => handleToggle('both_services', e.target.checked)}
              />
              Residential & commercial listed
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                checked={specialist_pests}
                disabled={isDisabled('specialist_pests')}
                onChange={(e) => handleToggle('specialist_pests', e.target.checked)}
              />
              Wider pest coverage (declared)
            </label>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Based on services or pest types listed by the provider or source. This does not indicate expertise or specialisation.
          </p>
        </div>
      </div>

      {/* Preferences (not verified) */}
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Preferences (not verified)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            These preferences aren’t verified in listings. Use them as a checklist when contacting providers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 rounded border-slate-300"
              checked={prefs.returnVisits}
              onChange={() => togglePref('returnVisits')}
            />
            <span className="text-sm text-slate-700">
              Prefer providers that offer return visits / follow-up
            </span>
          </label>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 rounded border-slate-300"
              checked={prefs.priceTransparency}
              onChange={() => togglePref('priceTransparency')}
            />
            <span className="text-sm text-slate-700">
              Prefer clear pricing upfront (price transparency)
            </span>
          </label>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 rounded border-slate-300"
              checked={prefs.freeQuote}
              onChange={() => togglePref('freeQuote')}
            />
            <span className="text-sm text-slate-700">
              Prefer free quote / inspection (where available)
            </span>
          </label>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 rounded border-slate-300"
              checked={prefs.calloutFeeClarity}
              onChange={() => togglePref('calloutFeeClarity')}
            />
            <span className="text-sm text-slate-700">Prefer call-out fee clarity</span>
          </label>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 rounded border-slate-300"
              checked={prefs.eveningWeekend}
              onChange={() => togglePref('eveningWeekend')}
            />
            <span className="text-sm text-slate-700">Prefer evening / weekend availability</span>
          </label>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 rounded border-slate-300"
              checked={prefs.discreetService}
              onChange={() => togglePref('discreetService')}
            />
            <span className="text-sm text-slate-700">
              Prefer discreet attendance (if needed)
            </span>
          </label>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 rounded border-slate-300"
              checked={prefs.writtenReport}
              onChange={() => togglePref('writtenReport')}
            />
            <span className="text-sm text-slate-700">
              Prefer written service report after treatment
            </span>
          </label>
        </div>

        {/* Call script */}
        <div className="mt-4 rounded-md bg-slate-50 border border-slate-200 p-3">
          <div className="text-xs font-semibold text-slate-800 mb-1">
            Quick call script
          </div>

          {selectedPrefQuestions.length === 0 ? (
            <p className="text-xs text-slate-600">
              Select preferences above to generate a checklist of questions to ask during your first call.
            </p>
          ) : (
            <ol className="list-decimal ml-4 space-y-1 text-xs text-slate-700">
              {selectedPrefQuestions.map((qq, idx) => (
                <li key={idx}>{qq}</li>
              ))}
            </ol>
          )}

          <p className="text-[11px] text-slate-500 mt-2">
            Tip: write down answers from 2–3 providers before choosing.
          </p>
        </div>
      </div>
    </div>
  );
}
