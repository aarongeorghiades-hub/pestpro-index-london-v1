'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Provider {
  provider_id: number;
  provider_name: string;
  website: string | null;
  [key: string]: any;
}

interface FilterCounts {
  [key: string]: number;
}

export default function CommercialPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCounts, setFilterCounts] = useState<FilterCounts>({});
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('quality');
  const [currentPage, setCurrentPage] = useState(1);
  const pathname = usePathname();

  const itemsPerPage = 12;

  // Navigation items
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/residential', label: 'Residential' },
    { href: '/commercial', label: 'Commercial' },
    { href: '/professionals', label: 'Professionals' },
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  // Filter categories
  const filterCategories = {
    certifications: [
      { key: 'bpca_member', label: 'BPCA Member' },
      { key: 'npta_member', label: 'NPTA Member' },
      { key: 'rsph_level_2', label: 'RSPH Level 2' },
      { key: 'safe_contractor', label: 'Safe Contractor' },
      { key: 'chas', label: 'CHAS' },
      { key: 'basis_prompt', label: 'Basis Prompt' },
      { key: 'cepa_certified', label: 'CEPA Certified' },
      { key: 'iso_9001', label: 'ISO 9001' },
      { key: 'iso_14001', label: 'ISO 14001' },
      { key: 'iso_45001', label: 'ISO 45001' },
      { key: 'constructionline', label: 'Constructionline' },
      { key: 'trustmark', label: 'Trustmark' },
    ],
    methods: [
      { key: 'heat_treatment', label: 'Heat Treatment' },
      { key: 'falconry_bird_control', label: 'Falconry/Bird Control' },
      { key: 'detection_dogs', label: 'Detection Dogs' },
      { key: 'high_rise_rope_access', label: 'High-Rise Rope Access' },
      { key: 'fumigation', label: 'Fumigation' },
      { key: 'proofing_services', label: 'Proofing Services' },
    ],
    contracts: [
      { key: 'flexible_contracts', label: 'Flexible Contracts' },
      { key: 'no_tie_in_contracts', label: 'No Tie-In Contracts' },
      { key: 'retainer_services', label: 'Retainer Services' },
      { key: 'one_off_services', label: 'One-Off Services' },
      { key: 'emergency_services_24_7', label: 'Emergency 24/7' },
    ],
    sectors: [
      { key: 'property_management', label: 'Property Management' },
      { key: 'social_housing', label: 'Social Housing' },
      { key: 'hospitality', label: 'Hospitality' },
      { key: 'healthcare', label: 'Healthcare' },
      { key: 'education', label: 'Education' },
      { key: 'retail', label: 'Retail' },
      { key: 'food_production', label: 'Food Production' },
      { key: 'warehousing_logistics', label: 'Warehousing/Logistics' },
    ],
    capabilities: [
      { key: 'multi_site_coverage', label: 'Multi-Site Coverage' },
      { key: 'national_coverage', label: 'National Coverage' },
      { key: 'unmarked_vehicles', label: 'Unmarked Vehicles' },
      { key: 'non_disruptive_services', label: 'Non-Disruptive Services' },
      { key: 'out_of_hours_services', label: 'Out-of-Hours Services' },
      { key: 'same_day_service', label: 'Same-Day Service' },
    ],
    credentials: [
      { key: 'free_surveys', label: 'Free Surveys' },
      { key: 'free_quotes', label: 'Free Quotes' },
      { key: 'guarantees_offered', label: 'Guarantees Offered' },
      { key: 'years_established_25_plus', label: '25+ Years Established' },
      { key: 'technician_count_50_plus', label: '50+ Technicians' },
      { key: 'service_areas_documented', label: 'Service Areas Documented' },
      { key: 'insurance_details_published', label: 'Insurance Details Published' },
      { key: 'eco_friendly_methods', label: 'Eco-Friendly Methods' },
      { key: 'humane_non_lethal_methods', label: 'Humane/Non-Lethal Methods' },
      { key: 'peta_endorsed', label: 'PETA Endorsed' },
      { key: 'rspca_recognized', label: 'RSPCA Recognized' },
    ],
  };

  // Load providers
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const { data, error } = await supabase
          .from('commercial_providers')
          .select('*');

        if (error) throw error;

        setProviders(data || []);
        calculateFilterCounts(data || []);
        applyFilters(data || [], new Set());
      } catch (error) {
        console.error('Error loading providers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, []);

  // Calculate filter counts
  const calculateFilterCounts = (data: Provider[]) => {
    const counts: FilterCounts = {};
    Object.values(filterCategories).forEach((category) => {
      category.forEach((filter) => {
        counts[filter.key] = data.filter((p) => p[filter.key] === true).length;
      });
    });
    setFilterCounts(counts);
  };

  // Calculate quality score
  const getQualityScore = (provider: Provider): number => {
    let score = 0;
    Object.values(filterCategories).forEach((category) => {
      category.forEach((filter) => {
        if (provider[filter.key] === true) score++;
      });
    });
    return score;
  };

  // Get quality badge
  const getQualityBadge = (score: number) => {
    if (score >= 40) return { label: 'Elite', color: 'bg-purple-100 text-purple-800' };
    if (score >= 30) return { label: 'Comprehensive', color: 'bg-blue-100 text-blue-800' };
    if (score >= 15) return { label: 'Good', color: 'bg-green-100 text-green-800' };
    return { label: 'Basic', color: 'bg-gray-100 text-gray-800' };
  };

  // Apply filters
  const applyFilters = (data: Provider[], filters: Set<string>) => {
    let filtered = data;

    if (filters.size > 0) {
      filtered = data.filter((provider) =>
        Array.from(filters).some((filter) => provider[filter] === true)
      );
    }

    // Sort
    if (sortBy === 'quality') {
      filtered.sort((a, b) => getQualityScore(b) - getQualityScore(a));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.provider_name.localeCompare(b.provider_name));
    }

    setFilteredProviders(filtered);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (filterKey: string) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(filterKey)) {
      newFilters.delete(filterKey);
    } else {
      newFilters.add(filterKey);
    }
    setSelectedFilters(newFilters);
    applyFilters(providers, newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters(new Set());
    applyFilters(providers, new Set());
  };

  // Pagination
  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);
  const paginatedProviders = filteredProviders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading commercial providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#050812] via-[#1e3a8a] to-[#050812] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image 
              src="/logo-horizontal-white-bg.png" 
              alt="PestPro Index Logo" 
              width={180} 
              height={50}
              className="h-auto"
            />
          </Link>

          {/* NAVIGATION - ALL TABS SAME BORDER */}
          <div className="hidden md:flex items-center gap-3">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-6 py-2.5 font-medium text-base border-2 border-white/40 rounded-xl transition-all duration-200
                  ${pathname === item.href
                    ? 'bg-[#1e3a8a] text-white'
                    : 'bg-transparent text-white hover:border-white/60 hover:bg-white/10'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <Image 
            src="/commercial-hero.png" 
            alt="Commercial pest control technician" 
            fill
            className="object-cover opacity-95"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/50 via-[#2563eb]/45 to-[#1e3a8a]/50"></div>
        </div>
        
        {/* CENTERED HERO CONTENT */}
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-7xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] text-white drop-shadow-[0_12px_36px_rgba(0,0,0,0.95)]">
            Commercial Pest Control
          </h1>
          <p className="text-3xl md:text-4xl mb-6 font-extralight tracking-[0.15em] text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)]">
            245 Verified Providers in London
          </p>
          <p className="text-xl text-white font-semibold max-w-3xl leading-relaxed drop-shadow-[0_6px_16px_rgba(0,0,0,0.85)] opacity-95">
            Find certified commercial pest control providers with advanced filtering by certifications, capabilities, and sectors.
          </p>
        </div>
      </section>

      {/* SECTION 1: FEATURED PROVIDERS - 4 COLUMNS WITH YELLOW BORDERS */}
      <section className="relative bg-gradient-to-br from-amber-50 to-white py-16 border-b-2 border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Featured Providers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Top-rated commercial pest control providers with verified certifications and comprehensive capabilities.
            </p>
          </div>

          {/* 4-COLUMN GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {providers
              .filter(p => p.bpca_member || p.npta_member)
              .sort((a, b) => getQualityScore(b) - getQualityScore(a))
              .slice(0, 8)
              .map(provider => {
                const score = getQualityScore(provider);
                const badge = getQualityBadge(score);
                return (
                  <div 
                    key={provider.provider_id} 
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-2 border-amber-400"
                  >
                    
                    {/* Featured Badge */}
                    <div className="inline-block px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 text-xs font-bold rounded-full mb-3 uppercase tracking-wide">
                      Featured
                    </div>

                    {/* Company Name */}
                    <h3 className="font-black text-base text-gray-900 mb-3 leading-tight line-clamp-2">
                      {provider.provider_name}
                    </h3>

                    {/* Quality Badge */}
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Certification Badges */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {provider.bpca_member && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-semibold">BPCA</span>
                      )}
                      {provider.npta_member && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-semibold">NPTA</span>
                      )}
                      {provider.rsph_level_2 && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded font-semibold">RSPH</span>
                      )}
                    </div>

                    {/* Contact Buttons */}
                    <div className="space-y-2">
                      {provider.website && (
                        <a 
                          href={provider.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-lg transition-all shadow-md"
                        >
                          Visit Website
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

        </div>
      </section>

      {/* PDF GUIDES SECTION - TWO GUIDES SIDE-BY-SIDE */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white py-16 border-b-2 border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Essential Guides for Commercial Pest Control
            </h2>
            <p className="text-lg text-gray-600">
              Expert resources to help you select the right provider and maintain compliance
            </p>
          </div>

          {/* Two Guides Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LEFT GUIDE */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-[#1e3a8a]">
              <div className="mb-6">
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  Commercial Provider Selection Guide
                </h3>
                <p className="text-sm font-semibold text-[#2563eb] mb-3">For Property Managers</p>
                <p className="text-3xl font-black text-[#f59e0b] mb-4">£14.99</p>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                Step-by-step guide to selecting the right commercial pest control provider for multi-unit properties and commercial portfolios.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-lg mt-0.5">•</span>
                  <p className="text-gray-700">Certification requirements to look for</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-lg mt-0.5">•</span>
                  <p className="text-gray-700">Contract evaluation frameworks</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-lg mt-0.5">•</span>
                  <p className="text-gray-700">RFP templates and checklists</p>
                </div>
              </div>
              
              <Link 
                href="https://pestproindex.lemonsqueezy.com/checkout/buy/8d8b4f4a-a913-48b3-bf8d-dfcaf6fcb5d6"
                className="block text-center px-6 py-3 bg-[#1e3a8a] text-white font-bold rounded-lg hover:bg-blue-900 transition-all shadow-md"
              >
                Get the Guide - £14.99
              </Link>
            </div>

            {/* RIGHT GUIDE */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-[#f59e0b]">
              <div className="mb-6">
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  Compliance Workbook
                </h3>
                <p className="text-sm font-semibold text-[#2563eb] mb-3">For Small Business Owners</p>
                <p className="text-3xl font-black text-[#f59e0b] mb-4">£29.99</p>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                Essential compliance requirements for commercial pest control in London.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-lg mt-0.5">•</span>
                  <p className="text-gray-700">Regulatory compliance checklist</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-lg mt-0.5">•</span>
                  <p className="text-gray-700">Documentation templates</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-lg mt-0.5">•</span>
                  <p className="text-gray-700">Audit preparation guide</p>
                </div>
              </div>
              
              <Link 
                href="https://pestproindex.lemonsqueezy.com/checkout/buy/8d8b4f4a-a913-48b3-bf8d-dfcaf6fcb5d6"
                className="block text-center px-6 py-3 bg-[#1e3a8a] text-white font-bold rounded-lg hover:bg-blue-900 transition-all shadow-md"
              >
                Get the Workbook - £29.99
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: TOP-RATED PROVIDERS */}
      <section className="relative bg-gradient-to-br from-white to-gray-50 py-16 border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Most Certified Providers
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Providers with comprehensive certifications across multiple categories
            </p>
          </div>

          {/* Top 8 High-Quality Cards (4 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {providers
              .filter(p => getQualityScore(p) >= 30)
              .sort((a, b) => getQualityScore(b) - getQualityScore(a))
              .slice(0, 8)
              .map(provider => {
                const score = getQualityScore(provider);
                const badge = getQualityBadge(score);
                return (
                  <div 
                    key={provider.provider_id} 
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border-l-4 border-[#1e3a8a]"
                  >
                    
                    {/* Company Name */}
                    <h3 className="font-bold text-base text-gray-900 mb-2 leading-tight line-clamp-2">
                      {provider.provider_name}
                    </h3>

                    {/* Quality Badge */}
                    <div className="mb-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Quality Score */}
                    <p className="text-sm text-gray-600 mb-4">
                      Quality Score: <span className="font-bold">{score}/48</span>
                    </p>

                    {/* Contact */}
                    <div className="space-y-2">
                      {provider.website && (
                        <a 
                          href={provider.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
                        >
                          Visit Website
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

        </div>
      </section>

      {/* SECTION 3: FULL PROVIDER LIST */}
      <section className="relative bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Full List of Commercial Providers
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              All 245 commercial providers with advanced filtering
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* FILTER SIDEBAR */}
            <aside className="w-full lg:w-80 lg:flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:sticky lg:top-24 border border-gray-100 max-h-[calc(100vh-7rem)] overflow-y-auto">
                
                {/* Filter Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                  {selectedFilters.size > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Results Count */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-black text-blue-900">{filteredProviders.length}</p>
                  <p className="text-sm text-blue-700">Providers Found</p>
                </div>

                {/* Certifications */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Certifications
                  </h4>
                  <div className="space-y-2">
                    {filterCategories.certifications.map(filter => (
                      <label key={filter.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFilters.has(filter.key)}
                          onChange={() => handleFilterChange(filter.key)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 flex-1">{filter.label}</span>
                        <span className="text-xs text-gray-500 font-medium">
                          ({filterCounts[filter.key] || 0})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Methods */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Methods
                  </h4>
                  <div className="space-y-2">
                    {filterCategories.methods.map(filter => (
                      <label key={filter.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFilters.has(filter.key)}
                          onChange={() => handleFilterChange(filter.key)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 flex-1">{filter.label}</span>
                        <span className="text-xs text-gray-500 font-medium">
                          ({filterCounts[filter.key] || 0})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Contracts */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Contracts
                  </h4>
                  <div className="space-y-2">
                    {filterCategories.contracts.map(filter => (
                      <label key={filter.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFilters.has(filter.key)}
                          onChange={() => handleFilterChange(filter.key)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 flex-1">{filter.label}</span>
                        <span className="text-xs text-gray-500 font-medium">
                          ({filterCounts[filter.key] || 0})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sectors */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Sectors
                  </h4>
                  <div className="space-y-2">
                    {filterCategories.sectors.map(filter => (
                      <label key={filter.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFilters.has(filter.key)}
                          onChange={() => handleFilterChange(filter.key)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 flex-1">{filter.label}</span>
                        <span className="text-xs text-gray-500 font-medium">
                          ({filterCounts[filter.key] || 0})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Capabilities */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Capabilities
                  </h4>
                  <div className="space-y-2">
                    {filterCategories.capabilities.map(filter => (
                      <label key={filter.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFilters.has(filter.key)}
                          onChange={() => handleFilterChange(filter.key)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 flex-1">{filter.label}</span>
                        <span className="text-xs text-gray-500 font-medium">
                          ({filterCounts[filter.key] || 0})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Credentials */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Credentials
                  </h4>
                  <div className="space-y-2">
                    {filterCategories.credentials.map(filter => (
                      <label key={filter.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFilters.has(filter.key)}
                          onChange={() => handleFilterChange(filter.key)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 flex-1">{filter.label}</span>
                        <span className="text-xs text-gray-500 font-medium">
                          ({filterCounts[filter.key] || 0})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading providers...</p>
                </div>
              ) : filteredProviders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg mb-4">No providers match your filters</p>
                  <button
                    onClick={clearAllFilters}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Sort and Results Info */}
                  <div className="flex justify-between items-center mb-8">
                    <p className="text-gray-600 font-medium">
                      Showing {paginatedProviders.length} of {filteredProviders.length} providers
                    </p>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        applyFilters(providers, selectedFilters);
                      }}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-900"
                    >
                      <option value="quality">Sort by Quality Score</option>
                      <option value="name">Sort by Name</option>
                    </select>
                  </div>

                  {/* Provider Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {paginatedProviders.map(provider => {
                      const score = getQualityScore(provider);
                      const badge = getQualityBadge(score);
                      const isTrophy = score >= 30;
                      const borderClass = isTrophy ? 'border-l-4 border-amber-500' : 'border-l-4 border-[#1e3a8a]';

                      return (
                        <div key={provider.provider_id} className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 ${borderClass}`}>
                          <h3 className="font-bold text-base text-gray-900 mb-3 leading-tight line-clamp-2">
                            {provider.provider_name}
                          </h3>
                          <div className="mb-3">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-4">
                            {isTrophy && <span className="text-2xl">⭐</span>}
                            <p className="text-sm text-gray-600 font-semibold">
                              {score} Certification{score !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="space-y-2">
                            {provider.website && (
                              <a href={provider.website} target="_blank" rel="noopener noreferrer" className="block text-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors">
                                Visit Website
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded font-semibold transition ${
                            currentPage === page
                              ? 'bg-[#1e3a8a] text-white'
                              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </main>

          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION - 3 COLUMNS */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white py-16 border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Commercial Products
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Professional-grade pest control products for commercial use
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Product 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-amber-400 hover:shadow-xl transition">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Professional Equipment</h3>
              <p className="text-gray-600 mb-6">Professional-grade equipment including sprayers, traps, proofing materials, and treatment solutions for large-scale pest control operations.</p>
              <Link href="/residential" className="inline-flex items-center gap-2 text-[#1e3a8a] hover:text-blue-900 font-semibold">
                View Products <span>→</span>
              </Link>
            </div>

            {/* Product 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-amber-400 hover:shadow-xl transition">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Monitoring Systems</h3>
              <p className="text-gray-600 mb-6">Advanced monitoring and detection systems for comprehensive pest management in commercial facilities and multi-site operations.</p>
              <Link href="/residential" className="inline-flex items-center gap-2 text-[#1e3a8a] hover:text-blue-900 font-semibold">
                View Products <span>→</span>
              </Link>
            </div>

            {/* Product 3 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-amber-400 hover:shadow-xl transition">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Compliance & Documentation</h3>
              <p className="text-gray-600 mb-6">Documentation, reporting, and compliance tools to meet regulatory requirements and maintain records for commercial pest control operations.</p>
              <Link href="/residential" className="inline-flex items-center gap-2 text-[#1e3a8a] hover:text-blue-900 font-semibold">
                View Products <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative bg-white py-16 border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Our methodology for finding the right commercial provider</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-8 border-t-4 border-[#1e3a8a]">
              <div className="text-5xl font-black text-[#1e3a8a] mb-4">1</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Independent Research</h3>
              <p className="text-gray-600">We independently verify provider certifications, capabilities, and credentials from official sources. No provider pays for inclusion.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-8 border-t-4 border-[#1e3a8a]">
              <div className="text-5xl font-black text-[#1e3a8a] mb-4">2</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Transparent Data</h3>
              <p className="text-gray-600">All provider information is displayed transparently. You see exactly what certifications, sectors, and capabilities each provider has.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-8 border-t-4 border-[#1e3a8a]">
              <div className="text-5xl font-black text-[#1e3a8a] mb-4">3</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Decision</h3>
              <p className="text-gray-600">You decide which provider is right for your business. Filter by your specific needs and contact providers directly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS PAGE LINK - BOTTOM */}
      <section className="relative bg-gray-50 py-12 border-t-2 border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Looking for Product Recommendations?
          </h3>
          <p className="text-gray-600 mb-6">
            Visit our Products page to see the most popular pest control products available today, organized by pest type. Includes user ratings and direct purchase links.
          </p>
          <Link 
            href="/products"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-lg"
          >
            View Products Page
            <span>→</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
