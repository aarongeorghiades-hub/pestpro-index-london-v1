'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function FilterBar() {
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
    router.push(`?${createQueryString(name, value)}`, { scroll: false });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 mb-8 space-y-4 md:space-y-0 md:flex md:gap-4 items-end">
      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-700 mb-1">Search Name</label>
        <input
          type="text"
          placeholder="Provider name..."
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          onChange={(e) => handleFilterChange('q', e.target.value)}
          defaultValue={searchParams.get('q') || ''}
        />
      </div>
      
      <div className="w-full md:w-48">
        <label className="block text-sm font-medium text-slate-700 mb-1">Pest Type</label>
        <select 
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          onChange={(e) => handleFilterChange('pest', e.target.value)}
          defaultValue={searchParams.get('pest') || ''}
        >
          <option value="">All Pests</option>
          <option value="rats">Rats</option>
          <option value="mice">Mice</option>
          <option value="bed bugs">Bed Bugs</option>
          <option value="wasps">Wasps</option>
          <option value="ants">Ants</option>
          <option value="cockroaches">Cockroaches</option>
          <option value="fleas">Fleas</option>
          <option value="moths">Moths</option>
          <option value="squirrels">Squirrels</option>
        </select>
      </div>

      <div className="w-full md:w-48">
        <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
        <select 
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          onChange={(e) => handleFilterChange('type', e.target.value)}
          defaultValue={searchParams.get('type') || ''}
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
            onChange={(e) => handleFilterChange('emergency', e.target.checked ? 'true' : '')}
            defaultChecked={searchParams.get('emergency') === 'true'}
          />
          <span className="text-sm text-slate-700">Emergency 24/7</span>
        </label>
      </div>
    </div>
  );
}
