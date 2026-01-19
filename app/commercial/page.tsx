'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface Provider {
  provider_id: number;
  provider_name: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  quality_score: number;
  cert_bpca_member?: boolean;
  cert_npta_member?: boolean;
  cert_rsph_member?: boolean;
  method_chemical?: boolean;
  method_mechanical?: boolean;
  method_thermal?: boolean;
  contract_one_off?: boolean;
  contract_quarterly?: boolean;
  contract_monthly?: boolean;
  contract_annual?: boolean;
  sector_food_manufacturing?: boolean;
  sector_hospitality?: boolean;
  sector_retail?: boolean;
  sector_healthcare?: boolean;
}

interface Filters {
  certifications: string[];
  methods: string[];
  contracts: string[];
  sectors: string[];
}

const CERTIFICATION_FILTERS = [
  { value: 'cert_bpca_member', label: 'BPCA Member', count: 47 },
  { value: 'cert_npta_member', label: 'NPTA Member', count: 30 },
  { value: 'cert_rsph_member', label: 'RSPH Member', count: 40 },
];

const METHOD_FILTERS = [
  { value: 'method_chemical', label: 'Chemical Treatment', count: 120 },
  { value: 'method_mechanical', label: 'Mechanical Control', count: 95 },
  { value: 'method_thermal', label: 'Thermal Treatment', count: 45 },
];

const CONTRACT_FILTERS = [
  { value: 'contract_one_off', label: 'One-Off Treatment', count: 80 },
  { value: 'contract_quarterly', label: 'Quarterly Contracts', count: 120 },
  { value: 'contract_monthly', label: 'Monthly Contracts', count: 135 },
  { value: 'contract_annual', label: 'Annual Contracts', count: 100 },
];

const SECTOR_FILTERS = [
  { value: 'sector_food_manufacturing', label: 'Food Manufacturing', count: 90 },
  { value: 'sector_hospitality', label: 'Hospitality & Catering', count: 110 },
  { value: 'sector_retail', label: 'Retail', count: 75 },
  { value: 'sector_healthcare', label: 'Healthcare', count: 65 },
];

export default function CommercialPage() {
  const pathname = usePathname();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [filters, setFilters] = useState<Filters>({
    certifications: [],
    methods: [],
    contracts: [],
    sectors: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchProviders = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('commercial_providers')
        .select('*');
      
      if (error) {
        console.error('Error fetching providers:', error);
        return;
      }
      
      setProviders(data || []);
      setFilteredProviders(data || []);
    };

    fetchProviders();
  }, []);

  useEffect(() => {
    let filtered = providers;

    if (filters.certifications.length > 0) {
      filtered = filtered.filter((p) =>
        filters.certifications.some((cert) => p[cert as keyof Provider])
      );
    }

    if (filters.methods.length > 0) {
      filtered = filtered.filter((p) =>
        filters.methods.some((method) => p[method as keyof Provider])
      );
    }

    if (filters.contracts.length > 0) {
      filtered = filtered.filter((p) =>
        filters.contracts.some((contract) => p[contract as keyof Provider])
      );
    }

    if (filters.sectors.length > 0) {
      filtered = filtered.filter((p) =>
        filters.sectors.some((sector) => p[sector as keyof Provider])
      );
    }

    setFilteredProviders(filtered);
    setCurrentPage(1);
  }, [filters, providers]);

  const toggleFilter = (category: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((f) => f !== value)
        : [...prev[category], value],
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      certifications: [],
      methods: [],
      contracts: [],
      sectors: [],
    });
  };

  const paginatedProviders = filteredProviders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#050812] via-[#1e3a8a] to-[#050812] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-horizontal-white-bg.png"
              alt="PestPro Index"
              width={180}
              height={50}
              className="h-12 w-auto"
            />
          </Link>
          <nav className="flex gap-2">
            {[
              { label: 'Home', href: '/' },
              { label: 'Residential', href: '/residential' },
              { label: 'Commercial', href: '/commercial' },
              { label: 'Professionals', href: '/professionals' },
              { label: 'Products', href: '/products' },
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  pathname === item.href
                    ? 'bg-[#1e3a8a] border-white text-white'
                    : 'border-white/30 text-white/70 hover:border-white/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative h-96 overflow-hidden">
        <Image
          src="/commercial-hero.png"
          alt="Commercial Pest Control"
          fill
          className="object-cover opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/80 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center items-start px-8">
          <h1 className="text-7xl font-black text-white drop-shadow-lg">Commercial</h1>
          <p className="text-3xl text-white/90 drop-shadow-lg mt-2">
            Find the right pest control provider for your business
          </p>
        </div>
      </section>

      {/* FEATURED PROVIDERS */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-black mb-2">Featured Providers</h2>
        <p className="text-gray-600 mb-8">Trusted partners for commercial pest management</p>
        <div className="grid grid-cols-4 gap-6">
          {providers.slice(0, 8).map((provider) => (
            <div
              key={provider.provider_id}
              className="border-2 border-amber-400 rounded-xl p-6 bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-black text-lg">{provider.provider_name}</h3>
                {provider.quality_score >= 30 && <span className="text-2xl">⭐</span>}
              </div>
              <p className="text-sm text-gray-600 mb-4">{provider.quality_score} Certifications</p>
              {provider.website && (
                <Link
                  href={provider.website}
                  target="_blank"
                  className="inline-block px-4 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-semibold hover:bg-[#1e40af]"
                >
                  Visit Website
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* PDF GUIDES */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-black mb-8">Commercial Guides</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
            <h3 className="text-2xl font-black mb-2">Commercial Provider Selection Guide</h3>
            <p className="text-sm text-gray-600 mb-4">For Property Managers</p>
            <p className="text-3xl font-black text-amber-400 mb-4">£14.99</p>
            <p className="text-gray-700 mb-6">
              Step-by-step guide to selecting the right commercial pest control provider for multi-unit properties and commercial portfolios.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-black">•</span>
                <span>Certification requirements to look for</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-black">•</span>
                <span>Contract evaluation frameworks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-black">•</span>
                <span>RFP templates and checklists</span>
              </li>
            </ul>
            <Link
              href="https://pestproindex.lemonsqueezy.com/checkout/buy/8d8b4f4a-a913-48b3-bf8d-dfcaf6fcb5d6"
              target="_blank"
              className="inline-block px-6 py-3 bg-amber-400 text-black rounded-lg font-semibold hover:bg-amber-500"
            >
              Get the Guide - £14.99
            </Link>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
            <h3 className="text-2xl font-black mb-2">Compliance Workbook</h3>
            <p className="text-sm text-gray-600 mb-4">For Small Business Owners</p>
            <p className="text-3xl font-black text-amber-400 mb-4">£29.99</p>
            <p className="text-gray-700 mb-6">
              Essential compliance requirements for commercial pest control in London.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-black">•</span>
                <span>Regulatory compliance checklist</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-black">•</span>
                <span>Documentation templates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-black">•</span>
                <span>Audit preparation guide</span>
              </li>
            </ul>
            <Link
              href="https://pestproindex.lemonsqueezy.com/checkout/buy/8d8b4f4a-a913-48b3-bf8d-dfcaf6fcb5d6"
              target="_blank"
              className="inline-block px-6 py-3 bg-amber-400 text-black rounded-lg font-semibold hover:bg-amber-500"
            >
              Get the Workbook - £29.99
            </Link>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-black mb-8">Products</h2>
        <div className="grid grid-cols-3 gap-8">
          {[
            { title: 'Professional Equipment', desc: 'Traps, solutions, proofing, sprayers' },
            { title: 'Monitoring Systems', desc: 'Real-time tracking and alerts' },
            { title: 'Compliance & Documentation', desc: 'Templates and audit tools' },
          ].map((product) => (
            <div key={product.title} className="border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-black mb-2">{product.title}</h3>
              <p className="text-gray-600 mb-4">{product.desc}</p>
              <Link
                href="/residential"
                className="inline-block px-4 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-semibold hover:bg-[#1e40af]"
              >
                View Products →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-black mb-8">How It Works</h2>
        <div className="grid grid-cols-3 gap-8">
          {[
            {
              title: 'Independent Research',
              desc: 'We independently audit and verify all commercial pest control providers',
            },
            {
              title: 'Transparent Data',
              desc: 'All certifications and capabilities are verified and displayed transparently',
            },
            {
              title: 'Your Decision',
              desc: 'You make the final decision based on complete, unbiased information',
            },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <h3 className="text-xl font-black mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MOST CERTIFIED PROVIDERS */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-black mb-2">Most Certified Providers</h2>
        <p className="text-gray-600 mb-8">
          Providers with comprehensive certifications across multiple categories
        </p>
        <div className="grid grid-cols-4 gap-6">
          {providers
            .filter((p) => p.quality_score >= 30)
            .slice(0, 4)
            .map((provider) => (
              <div
                key={provider.provider_id}
                className="border-2 border-gray-300 rounded-xl p-6 bg-white shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-black text-lg">{provider.provider_name}</h3>
                  <span className="text-2xl">⭐</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{provider.quality_score} Certifications</p>
                {provider.website && (
                  <Link
                    href={provider.website}
                    target="_blank"
                    className="inline-block px-4 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-semibold hover:bg-[#1e40af]"
                  >
                    Visit Website
                  </Link>
                )}
              </div>
            ))}
        </div>
      </section>

      {/* PROVIDERS LIST WITH FILTERS */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-black mb-8">All Providers ({filteredProviders.length})</h2>
        <div className="flex gap-8">
          {/* SIDEBAR FILTERS */}
          <div className="w-64 sticky top-24 h-fit">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-lg">Filters</h3>
                {Object.values(filters).some((f) => f.length > 0) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="mb-6">
                <h4 className="font-black text-sm mb-3">Certifications</h4>
                {CERTIFICATION_FILTERS.map((filter) => (
                  <label key={filter.value} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.certifications.includes(filter.value)}
                      onChange={() => toggleFilter('certifications', filter.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{filter.label}</span>
                    <span className="text-xs text-gray-500">({filter.count})</span>
                  </label>
                ))}
              </div>

              <div className="mb-6">
                <h4 className="font-black text-sm mb-3">Methods</h4>
                {METHOD_FILTERS.map((filter) => (
                  <label key={filter.value} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.methods.includes(filter.value)}
                      onChange={() => toggleFilter('methods', filter.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{filter.label}</span>
                    <span className="text-xs text-gray-500">({filter.count})</span>
                  </label>
                ))}
              </div>

              <div className="mb-6">
                <h4 className="font-black text-sm mb-3">Contract Types</h4>
                {CONTRACT_FILTERS.map((filter) => (
                  <label key={filter.value} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.contracts.includes(filter.value)}
                      onChange={() => toggleFilter('contracts', filter.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{filter.label}</span>
                    <span className="text-xs text-gray-500">({filter.count})</span>
                  </label>
                ))}
              </div>

              <div>
                <h4 className="font-black text-sm mb-3">Sectors</h4>
                {SECTOR_FILTERS.map((filter) => (
                  <label key={filter.value} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.sectors.includes(filter.value)}
                      onChange={() => toggleFilter('sectors', filter.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{filter.label}</span>
                    <span className="text-xs text-gray-500">({filter.count})</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* PROVIDERS GRID */}
          <div className="flex-1">
            {filteredProviders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No providers match your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {paginatedProviders.map((provider) => (
                    <div
                      key={provider.provider_id}
                      className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-black text-lg">{provider.provider_name}</h3>
                        {provider.quality_score >= 30 && <span className="text-2xl">⭐</span>}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{provider.quality_score} Certifications</p>
                      {provider.website && (
                        <Link
                          href={provider.website}
                          target="_blank"
                          className="inline-block px-4 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-semibold hover:bg-[#1e40af]"
                        >
                          Visit Website
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          currentPage === page
                            ? 'bg-[#2563eb] text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/products" className="text-blue-600 hover:text-blue-800 font-semibold">
            View Products Page →
          </Link>
        </div>
      </footer>
    </div>
  );
}
