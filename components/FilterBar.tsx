'use client';

export default function FilterBar({ counts }: { counts?: Record<string, number> }) {
  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
      Filters loading…
    </div>
  );
}
