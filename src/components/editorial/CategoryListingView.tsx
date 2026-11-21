import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, Search, SlidersHorizontal, AlertCircle } from 'lucide-react';
import {
  CATALOG_PRODUCTS,
  CATEGORY_TILES,
  INDIAN_STORES_DIRECTORY,
  UserPricePreferences,
  getProductSpread,
} from '../../data/indianCatalog.ts';
import { SearchResultResponse } from '../../types/product.ts';
import { formatINR } from '../../core/formatters.ts';
import { EditorialBadge, MonoLink, SectionHeader, StudioImage } from './Primitives.tsx';

interface CategoryListingViewProps {
  initialCategoryId: string;
  initialSearchQuery?: string;
  prefs: UserPricePreferences;
  onSelectProduct: (productId: string) => void;
  onNavigateHome: () => void;
}

type ListingSort = 'LOWEST_PRICE' | 'BIGGEST_GAP' | 'TRUST_SCORE';

export const CategoryListingView: React.FC<CategoryListingViewProps> = ({
  initialCategoryId,
  initialSearchQuery = '',
  prefs,
  onSelectProduct,
  onNavigateHome,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<ListingSort>('LOWEST_PRICE');
  const [localQuery, setLocalQuery] = useState(initialSearchQuery);

  // Optional live backend search fallback when user searches non-catalog keywords
  const [liveResults, setLiveResults] = useState<SearchResultResponse | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState(false);

  useEffect(() => {
    setSelectedCategory(initialCategoryId);
  }, [initialCategoryId]);

  useEffect(() => {
    setLocalQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  const filteredProducts = useMemo(() => {
    let list = [...CATALOG_PRODUCTS];

    if (selectedCategory !== 'all' && selectedCategory !== 'stores') {
      list = list.filter((p) => p.categoryId === selectedCategory);
    }

    if (selectedStoreFilter !== 'all') {
      list = list.filter((p) => p.listings.some((l) => l.storeId === selectedStoreFilter));
    }

    if (localQuery.trim()) {
      const q = localQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.listings.some((l) => l.storeName.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => {
      const sa = getProductSpread(a, prefs);
      const sb = getProductSpread(b, prefs);
      if (sortBy === 'BIGGEST_GAP') return sb.spread - sa.spread;
      if (sortBy === 'TRUST_SCORE') return sb.maxTrust - sa.maxTrust;
      return sa.lowest.finalPayablePrice - sb.lowest.finalPayablePrice;
    });
  }, [selectedCategory, selectedStoreFilter, localQuery, sortBy, prefs]);

  // Trigger real /api/search if user types a custom query not in curated Indian catalog
  useEffect(() => {
    const q = localQuery.trim();
    if (!q || filteredProducts.length > 0) {
      setLiveResults(null);
      return;
    }

    let cancelled = false;
    setIsLiveLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}&includeDemo=true`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.success && json.data) {
          setLiveResults(json.data);
        }
      })
      .catch(() => {
        if (!cancelled) setLiveResults(null);
      })
      .finally(() => {
        if (!cancelled) setIsLiveLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [localQuery, filteredProducts.length]);

  const activeCategoryName =
    selectedCategory === 'stores'
      ? 'Indian Store Fee & Policy Directory'
      : selectedCategory === 'all'
      ? 'All Audited Products'
      : CATEGORY_TILES.find((c) => c.id === selectedCategory)?.name || 'Category Directory';

  return (
    <div className="bg-[#FFFDF7] text-[#241E14] min-h-[70vh]">
      {/* Breadcrumb & Header */}
      <div className="border-b border-[#EFE3B8] bg-[#FFF8DF]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[#857861] flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-[#9A6700] hover:underline cursor-pointer"
            >
              HOME
            </button>
            <span>/</span>
            <span className="text-[#241E14]">{activeCategoryName}</span>
          </div>

          <SectionHeader
            eyebrow={
              selectedCategory === 'stores'
                ? 'STORE TRANSPARENCY INDEX · INDIA'
                : 'TRUE FINAL PRICE DIRECTORY · INR'
            }
            title={activeCategoryName}
            subtitle={
              selectedCategory === 'stores'
                ? 'Average hidden checkout fee drag and default return rules across major Indian retailers.'
                : 'Filter by category or Indian retailer. All displayed totals include fees, offers, and pincode delivery.'
            }
          />

          {/* Filter Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#EFE3B8]">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#F5B800] text-[#241E14] border-[#DDA300]'
                    : 'bg-white text-[#5C5240] border-[#EFE3B8] hover:border-[#F5B800] hover:text-[#241E14]'
                }`}
              >
                All ({CATALOG_PRODUCTS.length})
              </button>
              {CATEGORY_TILES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#F5B800] text-[#241E14] border-[#DDA300]'
                      : 'bg-white text-[#5C5240] border-[#EFE3B8] hover:border-[#F5B800] hover:text-[#241E14]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedCategory('stores')}
                className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedCategory === 'stores'
                    ? 'bg-[#241E14] text-[#FFFDF7] border-[#241E14]'
                    : 'bg-[#FEF0B8] text-[#855400] border-[#E6D496] hover:border-[#F5B800] hover:bg-[#F5B800] hover:text-[#241E14]'
                }`}
              >
                Store Audits (8)
              </button>
            </div>

            {selectedCategory !== 'stores' && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Tactile Hover-Effect Filter Search Bar */}
                <div className="relative group rounded-xl bg-white border border-[#E6D496] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#F5B800] hover:shadow-[0_6px_18px_-4px_rgba(245,184,0,0.35)] focus-within:-translate-y-0.5 focus-within:border-[#F5B800] focus-within:ring-2 focus-within:ring-[#F5B800]/30">
                  <Search className="w-3.5 h-3.5 text-[#857861] group-hover:text-[#9A6700] group-focus-within:text-[#9A6700] transition-colors absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    placeholder="Filter products or stores..."
                    className="h-9 pl-8 pr-3 bg-transparent text-xs text-[#241E14] placeholder-[#857861] outline-none w-48 sm:w-56"
                  />
                </div>

                <div className="flex items-center bg-white border border-[#E6D496] hover:border-[#F5B800] rounded-xl px-2.5 h-9 transition-colors">
                  <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-[#855400]" />
                  <select
                    value={selectedStoreFilter}
                    onChange={(e) => setSelectedStoreFilter(e.target.value)}
                    aria-label="Filter by Indian store"
                    className="bg-transparent font-mono text-[11px] font-semibold text-[#241E14] outline-none cursor-pointer"
                  >
                    <option value="all">All Indian Stores</option>
                    {INDIAN_STORES_DIRECTORY.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as ListingSort)}
                  aria-label="Sort products"
                  className="h-9 px-2.5 bg-white border border-[#E6D496] hover:border-[#F5B800] rounded-xl font-mono text-[11px] font-semibold text-[#241E14] outline-none cursor-pointer transition-colors"
                >
                  <option value="LOWEST_PRICE">Sort: Lowest True Price</option>
                  <option value="BIGGEST_GAP">Sort: Biggest Price Gap</option>
                  <option value="TRUST_SCORE">Sort: Highest Trust Score</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Listing Content */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* STORE AUDITS VIEW */}
        {selectedCategory === 'stores' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {INDIAN_STORES_DIRECTORY.map((store) => (
              <div
                key={store.id}
                className="border border-[#EFE3B8] hover:border-[#F5B800] rounded-2xl bg-white p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(180,130,0,0.2)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex w-9 h-9 rounded-lg bg-[#FEF0B8] border border-[#E6D496] text-[#241E14] font-mono text-xs font-bold items-center justify-center mb-3">
                      {store.shortCode}
                    </span>
                    <h3 className="text-lg font-bold text-[#241E14]">{store.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#FFF8DF] border border-[#EFE3B8] font-mono text-xs font-bold text-[#855400]">
                    {store.trustAvg}/100
                  </span>
                </div>

                <div className="space-y-2 border-y border-[#EFE3B8] py-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#5C5240]">Avg Checkout Fee Drag</span>
                    <span className="font-mono font-bold text-[#B45309]">{store.avgFeeDrag}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#5C5240]">Default Return</span>
                    <span className="font-semibold text-right text-[#241E14]">
                      {store.typicalReturn}
                    </span>
                  </div>
                </div>

                <MonoLink
                  onClick={() => {
                    setSelectedStoreFilter(store.id);
                    setSelectedCategory('all');
                  }}
                >
                  VIEW {store.name.toUpperCase()} AUDITS
                </MonoLink>
              </div>
            ))}
          </div>
        ) : isLiveLoading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-busy="true">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="border border-[#EFE3B8] rounded-2xl bg-white p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-[4/3] rounded-xl bg-[#FFF8DF]" />
                <div className="h-4 rounded bg-[#FEF0B8] w-2/3" />
                <div className="h-6 rounded bg-[#FEF0B8] w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Curated Indian Audited Products Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const { lowest, highest, spread, maxTrust } = getProductSpread(product, prefs);
              return (
                <article
                  key={product.id}
                  onClick={() => onSelectProduct(product.id)}
                  className="border border-[#EFE3B8] hover:border-[#F5B800] rounded-2xl bg-white overflow-hidden flex flex-col cursor-pointer group hover:-translate-y-1 hover:shadow-[0_14px_32px_-12px_rgba(180,130,0,0.22)] transition-all duration-200"
                >
                  <div className="relative aspect-[4/3] bg-[#FFF8DF] border-b border-[#EFE3B8] overflow-hidden">
                    <StudioImage
                      src={product.images[0]}
                      alt={product.shortName}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                      containerClassName="w-full h-full"
                    />
                    <div className="absolute top-3 left-3">
                      <EditorialBadge variant="dark" withGreenSquare>
                        UPDATED {product.updatedAgo}
                      </EditorialBadge>
                    </div>
                    {spread > 0 && (
                      <div className="absolute bottom-3 right-3">
                        <EditorialBadge variant="amber">
                          {formatINR(spread)} SPREAD
                        </EditorialBadge>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.09em] text-[#857861]">
                        {product.storesChecked} STORES · {product.feesChecked} FEES CHECKED
                      </p>
                      <h3 className="mt-1.5 text-[17px] font-bold text-[#241E14] leading-snug group-hover:text-[#9A6700] transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    <div className="pt-4 border-t border-[#EFE3B8] space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="block font-mono text-[10px] uppercase text-[#5C5240]">
                            BEST TRUE PRICE ({lowest.listing.storeName})
                          </span>
                          <span className="font-mono text-2xl font-bold text-[#241E14] tabular-price">
                            {formatINR(lowest.finalPayablePrice)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block font-mono text-[10px] uppercase text-[#857861]">
                            HIGHEST STORE
                          </span>
                          <span className="font-mono text-sm text-[#857861] line-through tabular-price">
                            {formatINR(highest.finalPayablePrice)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 font-mono text-[10px] uppercase">
                        <span className="text-[#855400] font-semibold">
                          ■ TRUST SCORE {maxTrust}/100
                        </span>
                        <span className="text-[#241E14] font-semibold group-hover:text-[#9A6700]">
                          COMPARE STORES →
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : liveResults && liveResults.products.length > 0 ? (
          /* Live Backend Provider Results for Custom Queries */
          <div className="space-y-6">
            <div className="p-4 rounded-2xl border border-[#E6D496] bg-[#FEF0B8] flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-semibold uppercase text-[#241E14]">
                ■ LIVE BACKEND PROVIDERS FOUND {liveResults.totalOffers} OFFERS FOR &ldquo;{localQuery}&rdquo;
              </span>
              <button
                type="button"
                onClick={() => setLocalQuery('')}
                className="font-mono text-[11px] font-semibold uppercase underline text-[#855400] hover:text-[#241E14] cursor-pointer"
              >
                Reset search
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {liveResults.products.flatMap((g) => g.offers).slice(0, 9).map((offer) => (
                <div
                  key={offer.id}
                  className="border border-[#EFE3B8] hover:border-[#F5B800] rounded-2xl bg-white p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(180,130,0,0.2)]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <EditorialBadge
                        variant={offer.dataSource.isLive ? 'green-outline' : 'light'}
                        withGreenSquare={offer.dataSource.isLive}
                      >
                        {offer.dataSource.isLive ? 'LIVE FEED' : 'DEMO CATALOG'}
                      </EditorialBadge>
                      <span className="font-mono text-[10px] text-[#857861]">
                        GRADE {offer.totalCostCalculation.transparencyGrade}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#241E14] leading-snug">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-[#5C5240] mt-1">Seller: {offer.seller.name}</p>
                  </div>

                  <div className="pt-3 border-t border-[#EFE3B8] flex items-end justify-between">
                    <div>
                      <span className="block font-mono text-[10px] uppercase text-[#5C5240]">
                        TOTAL KNOWN COST
                      </span>
                      <span className="font-mono text-xl font-bold text-[#241E14] tabular-price">
                        {formatINR(offer.totalCostCalculation.knownTotal)}
                      </span>
                    </div>
                    <a
                      href={offer.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-[#F5B800] text-[#241E14] font-mono text-[10px] font-bold uppercase hover:bg-[#EAB308] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>VIEW</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Clean Empty State */
          <div className="border border-[#E6D496] rounded-2xl bg-[#FFF8DF] p-12 text-center max-w-xl mx-auto">
            <AlertCircle className="w-8 h-8 text-[#9A6700] mx-auto mb-3" />
            <div className="mono-eyebrow text-[#855400] mb-1.5">NO MATCHING AUDITS</div>
            <h3 className="text-xl font-bold text-[#241E14]">
              No audited stores matched &ldquo;{localQuery || selectedStoreFilter}&rdquo;
            </h3>
            <p className="mt-2 text-sm text-[#5C5240]">
              Clear your filters or explore our freshly verified Indian electronics and appliance
              audits.
            </p>
            <button
              type="button"
              onClick={() => {
                setLocalQuery('');
                setSelectedCategory('all');
                setSelectedStoreFilter('all');
              }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#F5B800] text-[#241E14] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#EAB308] transition-colors cursor-pointer"
            >
              SHOW ALL AUDITED PRODUCTS →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
