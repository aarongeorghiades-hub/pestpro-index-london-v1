'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

// ============================================================================
// INTERFACES
// ============================================================================

interface Provider {
  canonical_id?: number;
  name: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  business_residential: boolean;
  
  // 20 pest type filters
  pest_mice: boolean;
  pest_rats: boolean;
  pest_rodents_general: boolean;
  pest_bed_bugs: boolean;
  pest_wasps: boolean;
  pest_cockroaches: boolean;
  pest_ants: boolean;
  pest_fleas: boolean;
  pest_moths: boolean;
  pest_pigeons: boolean;
  pest_birds_general: boolean;
  pest_squirrels: boolean;
  pest_flies: boolean;
  pest_bees: boolean;
  pest_foxes: boolean;
  pest_spiders: boolean;
  pest_seagulls: boolean;
  pest_silverfish: boolean;
  pest_beetles: boolean;
  pest_ladybirds: boolean;
  
  // 7 service feature filters
  service_eco_friendly: boolean;
  service_emergency_24_7: boolean;
  service_proofing: boolean;
  service_bpca_certified: boolean;
  service_guarantee: boolean;
  service_free_survey: boolean;
  service_weekend: boolean;
}

interface Filters {
  pests: string[];
  services: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PEST_FILTERS = [
  { value: 'pest_mice', label: 'Mice', count: 147 },
  { value: 'pest_rats', label: 'Rats', count: 153 },
  { value: 'pest_rodents_general', label: 'Rodents (General)', count: 148 },
  { value: 'pest_bed_bugs', label: 'Bed Bugs', count: 136 },
  { value: 'pest_wasps', label: 'Wasps & Hornets', count: 141 },
  { value: 'pest_cockroaches', label: 'Cockroaches', count: 124 },
  { value: 'pest_ants', label: 'Ants', count: 124 },
  { value: 'pest_fleas', label: 'Fleas', count: 115 },
  { value: 'pest_moths', label: 'Moths', count: 95 },
  { value: 'pest_pigeons', label: 'Pigeons', count: 103 },
  { value: 'pest_birds_general', label: 'Birds (General)', count: 138 },
  { value: 'pest_squirrels', label: 'Squirrels', count: 100 },
  { value: 'pest_flies', label: 'Flies', count: 83 },
  { value: 'pest_bees', label: 'Bees', count: 68 },
  { value: 'pest_foxes', label: 'Foxes', count: 59 },
  { value: 'pest_spiders', label: 'Spiders', count: 32 },
  { value: 'pest_seagulls', label: 'Seagulls', count: 49 },
  { value: 'pest_silverfish', label: 'Silverfish', count: 18 },
  { value: 'pest_beetles', label: 'Beetles', count: 25 },
  { value: 'pest_ladybirds', label: 'Ladybirds', count: 40 },
];

const SERVICE_FILTERS = [
  { value: 'service_eco_friendly', label: 'Eco-Friendly / Pet-Safe', count: 80 },
  { value: 'service_emergency_24_7', label: '24/7 Emergency Service', count: 109 },
  { value: 'service_proofing', label: 'Proofing / Prevention', count: 133 },
  { value: 'service_bpca_certified', label: 'BPCA Certified', count: 84 },
  { value: 'service_guarantee', label: 'Treatment Guarantee', count: 76 },
  { value: 'service_free_survey', label: 'Free Survey / Quote', count: 52 },
  { value: 'service_weekend', label: 'Weekend Service', count: 39 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getProviderTier(provider: Provider): 'featured' | 'high-rated' | 'regular' {
  if (provider.google_rating && provider.google_review_count && 
      provider.google_rating >= 4.5 && provider.google_review_count >= 30) {
    return 'high-rated';
  }
  return 'regular';
}

// ============================================================================
// PROVIDER CARD COMPONENT
// ============================================================================

function ProviderCard({ provider }: { provider: Provider }) {
  const tier = getProviderTier(provider);
  const isFeatured = tier === 'featured';
  const showTrophy = tier === 'high-rated' || tier === 'featured';
  
  return (
    <div className={`
      relative bg-white rounded-lg overflow-hidden
      border-l-4 transition-all duration-300 hover:shadow-xl
      ${isFeatured ? 'border-yellow-400 shadow-lg' : 'border-blue-500 shadow-md'}
    `}>
      <div className="flex">
        {/* LEFT SECTION - Main content */}
        <div className="flex-1 p-6">
          {/* Name with trophy INLINE */}
          <div className="flex items-center gap-2 mb-3">
            {showTrophy && <span className="text-2xl">🏆</span>}
            <h3 className="text-xl font-bold text-gray-900">{provider.name}</h3>
          </div>

          {/* Address */}
          {provider.address && (
            <p className="text-sm text-gray-600 mb-4 flex items-start gap-2">
              <span>📍</span>
              <span>{provider.address}</span>
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-2 mb-4">
            {provider.phone && (
              <a 
                href={`tel:${provider.phone}`}
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2.5 px-4 rounded-md font-semibold text-sm text-center flex items-center justify-center gap-2"
              >
                <span>📞</span>
                Call Now
              </a>
            )}
            {provider.website && (
              <a 
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white hover:bg-gray-50 text-gray-900 py-2.5 px-4 rounded-md font-semibold border border-gray-300 text-sm text-center"
              >
                Website
              </a>
            )}
          </div>

          {/* Service badges */}
          <div className="flex flex-wrap gap-2">
            {provider.service_emergency_24_7 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                🚨 24/7 Emergency
              </span>
            )}
            {provider.service_bpca_certified && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                ✅ BPCA Certified
              </span>
            )}
            {provider.service_eco_friendly && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                🌿 Eco-Friendly
              </span>
            )}
            {provider.service_proofing && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                🛡️ Pest Proofing
              </span>
            )}
          </div>
        </div>

        {/* RIGHT SECTION - Rating panel (CREAM BACKGROUND) */}
        {provider.google_rating && (
          <div className="w-24 bg-gradient-to-br from-amber-50 to-yellow-50 flex flex-col items-center justify-center border-l border-amber-100">
            <div className="text-yellow-500 text-2xl mb-1">⭐</div>
            <div className="text-2xl font-bold text-gray-900">
              {provider.google_rating.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 text-center px-2">
              {provider.google_review_count} reviews
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ResidentialPage() {
  const pathname = usePathname();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [filters, setFilters] = useState<Filters>({ pests: [], services: [] });
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch providers
  useEffect(() => {
    async function fetchProviders() {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('Providers')
        .select('*')
        .eq('business_residential', true)
        .order('google_rating', { ascending: false, nullsFirst: false });
      
      if (error) {
        console.error('Error fetching providers:', error);
      } else {
        setProviders(data || []);
        setFilteredProviders(data || []);
      }
      
      setLoading(false);
    }

    fetchProviders();
  }, []);

  // Apply filters
  useEffect(() => {
    if (providers.length === 0) return;

    let filtered = [...providers];

    if (filters.pests.length > 0) {
      filtered = filtered.filter(provider => 
        filters.pests.some(pestFilter => provider[pestFilter as keyof Provider] === true)
      );
    }

    if (filters.services.length > 0) {
      filtered = filtered.filter(provider =>
        filters.services.some(serviceFilter => provider[serviceFilter as keyof Provider] === true)
      );
    }

    setFilteredProviders(filtered);
  }, [filters, providers]);

  const handleFilterChange = (category: 'pests' | 'services', value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [category]: checked 
        ? [...prev[category], value]
        : prev[category].filter(v => v !== value)
    }));
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Residential', href: '/residential' },
    { label: 'Commercial', href: '/commercial' },
    { label: 'Professionals', href: '/professionals' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-800 via-blue-700 to-blue-800 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* LOGO - WHITE BACKGROUND WITH BUG */}
            <Link href="/" className="flex items-center">
              <div className="bg-white rounded-3xl px-6 py-4 flex items-center gap-3 shadow-lg border border-gray-200">
                
                {/* Magnifying glass with bug */}
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 64 64" className="w-full h-full">
                    {/* Outer ring */}
                    <circle cx="24" cy="24" r="18" fill="none" stroke="#374151" strokeWidth="3"/>
                    {/* Lens background */}
                    <circle cx="24" cy="24" r="15" fill="#F3F4F6"/>
                    
                    {/* Bug inside */}
                    <g transform="translate(24, 24)">
                      <ellipse cx="0" cy="0" rx="7" ry="9" fill="#1F2937"/>
                      <circle cx="0" cy="-6" r="4" fill="#1F2937"/>
                      <line x1="-5" y1="-3" x2="-10" y2="-5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="-5" y1="0" x2="-10" y2="0" stroke="#1F2937" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="-5" y1="3" x2="-10" y2="5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="5" y1="-3" x2="10" y2="-5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="5" y1="0" x2="10" y2="0" stroke="#1F2937" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="5" y1="3" x2="10" y2="5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="-2" y1="-8" x2="-3" y2="-11" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="2" y1="-8" x2="3" y2="-11" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round"/>
                    </g>
                    
                    {/* Handle */}
                    <g transform="rotate(45 40 40)">
                      <rect x="36" y="32" width="8" height="24" rx="4" fill="#374151"/>
                    </g>
                  </svg>
                </div>
                
                {/* Text */}
                <div className="leading-tight">
                  <div className="text-2xl font-bold text-gray-900">PestPro</div>
                  <div className="text-sm text-gray-500 font-medium">Index</div>
                </div>
              </div>
            </Link>

            {/* NAVIGATION PILLS */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-4 py-2 rounded-full font-medium text-sm border transition-all duration-200
                    ${pathname === item.href
                      ? 'bg-white/20 text-white border-white/50'
                      : 'bg-transparent text-white border-white/30 hover:bg-white/10'
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0">
            <img 
              src="/london-skyline.png" 
              alt="London skyline" 
              className="w-full h-full object-cover opacity-40"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/75 via-blue-800/70 to-blue-900/75"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">
            Residential Pest Control
          </h1>
          <h2 className="text-2xl md:text-3xl text-white font-light mb-6">
            Find Certified Providers in London
          </h2>
          <p className="text-lg text-white/90 max-w-3xl mx-auto">
            Filter by pest type and service features. Compare providers with transparent, provider-stated information. No endorsements, just evidence.
          </p>
        </div>
      </section>

      {/* FILTERS + RESULTS */}
      <section className="relative -mt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* FILTER SIDEBAR */}
            <aside className="w-full lg:w-80 lg:flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:sticky lg:top-24 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
                  <button 
                    onClick={() => setFilters({ pests: [], services: [] })}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>

                {(filters.pests.length > 0 || filters.services.length > 0) && (
                  <div className="mb-4 px-3 py-2 bg-blue-50 rounded-lg text-sm text-blue-900">
                    <span className="font-semibold">{filters.pests.length + filters.services.length}</span> filters active
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">🐭</span>
                    <span>Pest Type</span>
                  </h3>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {PEST_FILTERS.map((pest) => (
                      <label key={pest.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.pests.includes(pest.value)}
                          onChange={(e) => handleFilterChange('pests', pest.value, e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 text-sm flex-1">{pest.label}</span>
                        <span className="text-xs text-gray-400">{pest.count}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <span>Service Features</span>
                  </h3>
                  
                  <div className="space-y-2">
                    {SERVICE_FILTERS.map((service) => (
                      <label key={service.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.services.includes(service.value)}
                          onChange={(e) => handleFilterChange('services', service.value, e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 text-sm flex-1">{service.label}</span>
                        <span className="text-xs text-gray-400">{service.count}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* RESULTS */}
            <main className="flex-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {loading ? 'Loading...' : `${filteredProviders.length} Providers Found`}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {filters.pests.length > 0 || filters.services.length > 0
                        ? 'Filtered results based on your selections'
                        : 'Showing all providers in London'}
                    </p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">⏳</div>
                  <p className="text-gray-600">Loading providers...</p>
                </div>
              ) : filteredProviders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No providers match your filters</h3>
                  <p className="text-gray-600 mb-6">Try removing some filters to see more results</p>
                  <button 
                    onClick={() => setFilters({ pests: [], services: [] })}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProviders.map(provider => (
                    <ProviderCard key={provider.canonical_id} provider={provider} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}
// Trigger GitHub deployment
