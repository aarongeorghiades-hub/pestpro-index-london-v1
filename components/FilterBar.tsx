'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state so search doesn't push URL on every single keystroke.
  const [q, setQ] = useState(searchParams.get('q') || '');

  // Keep local state in sync if user hits back/forward.
  useEffect(() => {
    setQ(searchParams.get('q') || '');
  }, [searchParams]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const v = value.trim();

      if (v) params.set(name, v);
      else params.delete(name);

      // If no filters remain, return empty string so we can push a clean URL.
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

  // Debounce search updates slightly (keeps UI feeling stable)
  useEffect(() => {
    const t = setTimeout(() => {
      pushParams('q', q);
    }, 250);
    return () => clearTimeout(t);
  }, [q, pushParams]);

  const handleSelectChange = (name: string, value: string) => {
    pushParams(name, value);
  };

  const handleEmergencyChange = (checked: boolean) => {
    pushParams('emergency', checked ? 'true' : '');
  };

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      (searchParams.get('q') || '').trim() ||
        (searchParams.get('pest') || '').trim() ||
        (searchParams.get('type') || '').trim() ||
        searchParams.get('emergency') === 'true'
    );
  }, [searchParams]);

  const clearAll = () => {
    // Push the same page with no query params
    router.push('?', { scroll: false });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 mb-8 space-y-4 md:space-y-0 md:flex md:gap-4 items-end">
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
          onChange={(e) => handleSelectChange('pest', e.target.value)}
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
          onChange={(e) => handleSelectChange('type', e.target.value)}
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
            onChange={(e) => handleEmergencyChange(e.target.checked)}
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
  );
}
