/**
 * PriceProof — Main Application Component
 * A Full-Stack Product Price Comparison Web App
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { SearchBar } from './components/SearchBar.tsx';
import { FiltersAndSortBar } from './components/FiltersAndSortBar.tsx';
import { OfferCard } from './components/OfferCard.tsx';
import { FeeBreakdownModal } from './components/FeeBreakdownModal.tsx';
import { ComparisonMatrix } from './components/ComparisonMatrix.tsx';
import { ProviderDiagnosticsModal } from './components/ProviderDiagnosticsModal.tsx';
import { EmptyState } from './components/EmptyState.tsx';
import { EducationalSection } from './components/EducationalSection.tsx';
import {
  Offer,
  ProductGroup,
  ProviderDiagnostic,
  SearchResultResponse,
  SortOption,
} from './types/product.ts';
import { formatINR } from './core/formatters.ts';
import {
  ShieldAlert,
  Sparkles,
  Info,
  Clock,
  Layers,
  ChevronRight,
  TrendingDown,
  Scale,
} from 'lucide-react';

export default function App() {
  const [query, setQuery] = useState('wireless headphones');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([
    'demo_provider',
    'dummyjson_live',
    'amazon_paapi',
    'flipkart_affiliate',
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResultResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<ProviderDiagnostic[]>([]);

  // Modals & Drawers
  const [inspectedOffer, setInspectedOffer] = useState<Offer | null>(null);
  const [selectedForCompareIds, setSelectedForCompareIds] = useState<string[]>([]);
  const [isCompareMatrixOpen, setIsCompareMatrixOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  // Filters & Sorting
  const [sortBy, setSortBy] = useState<SortOption>('TOTAL_COST_ASC');
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [freeReturnsOnly, setFreeReturnsOnly] = useState(false);
  const [warrantyGuaranteed, setWarrantyGuaranteed] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Initial load: Fetch diagnostics and perform first demonstration search
  useEffect(() => {
    fetchDiagnostics();
    handleSearch('wireless headphones');
  }, []);

  const fetchDiagnostics = async () => {
    try {
      const res = await fetch('/api/providers');
      if (res.ok) {
        const data = await res.json();
        if (data.providers) {
          setDiagnostics(data.providers);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch provider diagnostics:', err);
    }
  };

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setQuery(searchTerm);

    try {
      const providersQuery = selectedProviders.join(',');
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchTerm)}&providers=${providersQuery}&includeDemo=true`
      );

      if (!res.ok) {
        throw new Error(`Search request failed with status ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setSearchResponse(json.data);
      } else {
        throw new Error(json.error || 'Failed to retrieve comparison offers.');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setErrorMessage(err.message || 'Network error occurred while fetching prices.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleProvider = (providerId: string) => {
    setSelectedProviders((prev) =>
      prev.includes(providerId) ? prev.filter((id) => id !== providerId) : [...prev, providerId]
    );
  };

  const handleToggleCompare = (offerId: string) => {
    setSelectedForCompareIds((prev) =>
      prev.includes(offerId) ? prev.filter((id) => id !== offerId) : [...prev, offerId]
    );
  };

  // Extract all offers from current response
  const allCurrentOffers = useMemo(() => {
    if (!searchResponse) return [];
    return searchResponse.products.flatMap((g) => g.offers);
  }, [searchResponse]);

  // Offers selected for comparison matrix
  const compareOffers = useMemo(() => {
    return allCurrentOffers.filter((o) => selectedForCompareIds.includes(o.id));
  }, [allCurrentOffers, selectedForCompareIds]);

  // Filtered & Sorted Product Groups
  const processedProductGroups = useMemo(() => {
    if (!searchResponse || !searchResponse.products) return [];

    return searchResponse.products
      .map((group) => {
        // Filter offers within group
        let filteredOffers = group.offers.filter((offer) => {
          if (freeDeliveryOnly && !offer.delivery.isFree) return false;
          if (freeReturnsOnly && !offer.returnPolicy.isFreeReturn) return false;
          if (warrantyGuaranteed && offer.warranty.durationMonths < 12) return false;
          if (verifiedOnly && offer.totalCostCalculation.completeness !== 'COMPLETE') return false;
          return true;
        });

        // Sort offers
        filteredOffers = [...filteredOffers].sort((a, b) => {
          switch (sortBy) {
            case 'TOTAL_COST_ASC':
              return a.totalCostCalculation.knownTotal - b.totalCostCalculation.knownTotal;
            case 'STICKER_PRICE_ASC':
              return a.basePrice - b.basePrice;
            case 'TRANSPARENCY_DESC': {
              const gradeOrder: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, F: 1 };
              return (
                (gradeOrder[b.totalCostCalculation.transparencyGrade] || 0) -
                (gradeOrder[a.totalCostCalculation.transparencyGrade] || 0)
              );
            }
            case 'DELIVERY_FASTEST':
              return (a.delivery.estimatedDays || 99) - (b.delivery.estimatedDays || 99);
            case 'WARRANTY_LONGEST':
              return b.warranty.durationMonths - a.warranty.durationMonths;
            default:
              return 0;
          }
        });

        return {
          ...group,
          offers: filteredOffers,
        };
      })
      .filter((group) => group.offers.length > 0);
  }, [
    searchResponse,
    sortBy,
    freeDeliveryOnly,
    freeReturnsOnly,
    warrantyGuaranteed,
    verifiedOnly,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Navbar */}
      <Navbar
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        diagnostics={diagnostics}
        totalOffers={searchResponse?.totalOffers || 0}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-4 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anti-Deception E-Commerce Cost Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Reveal the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Real Cost</span> of Online Shopping
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Sellers hide shipping fees, platform charges, and restocking penalties behind lower sticker prices.
            PriceProof calculates the actual out-of-pocket total automatically.
          </p>

          {/* Search Bar Input */}
          <div className="mt-6">
            <SearchBar
              onSearch={handleSearch}
              isLoading={isLoading}
              initialQuery={query}
              selectedProviders={selectedProviders}
              onToggleProvider={handleToggleProvider}
            />
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => handleSearch(query)}
              className="text-white underline hover:no-underline font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search Results Summary & Active Filters */}
        {searchResponse && (
          <div className="mt-6">
            {/* Active Data Providers Summary Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-850 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-semibold">Sources Searched:</span>
                {searchResponse.providersSummary.map((prov) => (
                  <span
                    key={prov.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${
                      prov.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : prov.status === 'DEMO'
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        prov.status === 'ACTIVE'
                          ? 'bg-emerald-400 animate-pulse'
                          : prov.status === 'DEMO'
                          ? 'bg-blue-400'
                          : 'bg-slate-500'
                      }`}
                    ></span>
                    <span className="font-medium">{prov.name}</span>
                    <span className="text-slate-500">({prov.offersCount} offers)</span>
                    {prov.latencyMs > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {prov.latencyMs}ms
                      </span>
                    )}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>Audited: {new Date(searchResponse.searchedAt).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Filter and Sort Bar */}
            <FiltersAndSortBar
              sortBy={sortBy}
              onSortChange={setSortBy}
              freeDeliveryOnly={freeDeliveryOnly}
              onToggleFreeDelivery={() => setFreeDeliveryOnly(!freeDeliveryOnly)}
              freeReturnsOnly={freeReturnsOnly}
              onToggleFreeReturns={() => setFreeReturnsOnly(!freeReturnsOnly)}
              warrantyGuaranteed={warrantyGuaranteed}
              onToggleWarrantyGuaranteed={() => setWarrantyGuaranteed(!warrantyGuaranteed)}
              verifiedOnly={verifiedOnly}
              onToggleVerifiedOnly={() => setVerifiedOnly(!verifiedOnly)}
              totalOffers={searchResponse.totalOffers}
              selectedForCompareCount={selectedForCompareIds.length}
              onOpenCompare={() => setIsCompareMatrixOpen(true)}
              onClearCompare={() => setSelectedForCompareIds([])}
            />

            {/* Product Groups & Offers */}
            {processedProductGroups.length > 0 ? (
              <div className="space-y-10">
                {processedProductGroups.map((group) => {
                  const cheapestOffer = group.offers.find((o) => o.id === group.cheapestOfferId) || group.offers[0];

                  return (
                    <div
                      key={group.id}
                      className="p-5 sm:p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-xl"
                    >
                      {/* Group Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80 mb-5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              {group.category}
                            </span>
                            <span className="text-xs text-slate-400">
                              {group.offers.length} sellers compared
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                            {group.canonicalTitle}
                          </h2>
                        </div>

                        {/* Lowest known total cost callout for this group */}
                        <div className="sm:text-right shrink-0">
                          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Lowest Real Cost Found
                          </div>
                          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                            {formatINR(cheapestOffer.totalCostCalculation.knownTotal)}
                          </div>
                          <div className="text-xs text-slate-400">
                            Sold by {cheapestOffer.seller.name}
                          </div>
                        </div>
                      </div>

                      {/* Warning if group has incomplete delivery charges */}
                      {group.warnings.length > 0 && (
                        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                          <Info className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>{group.warnings.join(' ')}</span>
                        </div>
                      )}

                      {/* Offers List */}
                      <div className="space-y-4">
                        {group.offers.map((offer) => (
                          <OfferCard
                            key={offer.id}
                            offer={offer}
                            onInspect={(o) => setInspectedOffer(o)}
                            isSelectedForCompare={selectedForCompareIds.includes(offer.id)}
                            onToggleCompare={handleToggleCompare}
                            isLowestTotalInGroup={offer.id === group.cheapestOfferId}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                query={query}
                onSuggestionClick={(term) => handleSearch(term)}
              />
            )}
          </div>
        )}

        {/* Educational Section: The 4 Hidden Fee Traps */}
        <EducationalSection />
      </main>

      {/* Floating Bottom Comparison Drawer Indicator if items selected */}
      {selectedForCompareIds.length > 0 && (
        <div className="fixed bottom-5 right-5 z-40 animate-in slide-in-from-bottom-5">
          <button
            onClick={() => setIsCompareMatrixOpen(true)}
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/30 hover:bg-emerald-400 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Open Side-by-Side Comparison ({selectedForCompareIds.length})</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <FeeBreakdownModal
        offer={inspectedOffer}
        onClose={() => setInspectedOffer(null)}
      />

      <ComparisonMatrix
        selectedOffers={compareOffers}
        onClose={() => setIsCompareMatrixOpen(false)}
        onRemoveOffer={(id) => handleToggleCompare(id)}
      />

      {isDiagnosticsOpen && (
        <ProviderDiagnosticsModal
          diagnostics={diagnostics}
          onClose={() => setIsDiagnosticsOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 mt-16 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">PriceProof</span>
            <span>—</span>
            <span>24-Hour Hackathon Project: Real Cost E-Commerce Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsDiagnosticsOpen(true)}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              API Diagnostics
            </button>
            <a
              href="https://github.com/priceproof/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              Documentation & Providers
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
