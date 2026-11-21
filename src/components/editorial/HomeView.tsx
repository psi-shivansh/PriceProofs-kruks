import React, { useState, useRef } from 'react';
import { Link2, Check, ChevronDown, ArrowRight, Loader2, Search, X } from 'lucide-react';
import {
  CATALOG_PRODUCTS,
  CATEGORY_TILES,
  FAQ_ITEMS,
  HERO_SLIDES,
  UserPricePreferences,
  getProductSpread,
} from '../../data/indianCatalog.ts';
import { formatINR } from '../../core/formatters.ts';
import {
  CarouselArrows,
  EditorialBadge,
  MonoLink,
  SectionHeader,
  StudioImage,
} from './Primitives.tsx';

interface HomeViewProps {
  prefs: UserPricePreferences;
  onSelectProduct: (productId: string) => void;
  onSelectCategory: (categoryId: string, searchQuery?: string) => void;
  onOpenDiagnostics: () => void;
  onOpenAiAssistant: () => void;
}

const ANALYSIS_STAGES = [
  'Fetching 13 stores',
  'Reading fees',
  'Reading return policies',
  'Calculating final price',
];

export const HomeView: React.FC<HomeViewProps> = ({
  prefs,
  onSelectProduct,
  onSelectCategory,
  onOpenDiagnostics,
  onOpenAiAssistant,
}) => {
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [isHeroSearchOpen, setIsHeroSearchOpen] = useState(false);

  const [pastedUrl, setPastedUrl] = useState('');
  const [analyzingStage, setAnalyzingStage] = useState<number | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const freshlyScrollRef = useRef<HTMLDivElement | null>(null);
  const gapsScrollRef = useRef<HTMLDivElement | null>(null);

  const currentSlide = HERO_SLIDES[heroIndex];

  const scrollTrack = (ref: React.RefObject<HTMLDivElement | null>, dir: -1 | 1) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * 360, behavior: 'smooth' });
  };

  const heroMatches = heroSearchQuery.trim()
    ? CATALOG_PRODUCTS.filter((p) => {
        const q = heroSearchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.listings.some((l) => l.storeName.toLowerCase().includes(q))
        );
      })
    : CATALOG_PRODUCTS.slice(0, 4);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = heroSearchQuery.trim();
    if (!trimmed) {
      onSelectCategory('all');
      return;
    }
    if (heroMatches.length === 1) {
      onSelectProduct(heroMatches[0].id);
    } else {
      onSelectCategory('all', trimmed);
    }
    setIsHeroSearchOpen(false);
  };

  const resolveProductFromUrl = (raw: string): string => {
    const lower = raw.toLowerCase();
    if (lower.includes('iphone')) return 'iphone-16-pro-256';
    if (lower.includes('sony') || lower.includes('xm5') || lower.includes('headphone'))
      return 'sony-wh1000xm5';
    if (lower.includes('garmin') || lower.includes('watch') || lower.includes('fenix'))
      return 'garmin-fenix-8';
    if (lower.includes('fuji') || lower.includes('camera') || lower.includes('xt5'))
      return 'fujifilm-xt5-kit';
    if (lower.includes('espresso') || lower.includes('breville') || lower.includes('coffee'))
      return 'breville-barista-express';
    return 'macbook-pro-16-m4';
  };

  const handleAnalyseLink = (e: React.FormEvent, overrideUrl?: string) => {
    e.preventDefault();
    const targetUrl = (overrideUrl ?? pastedUrl).trim();
    if (!targetUrl) {
      setUrlError(
        'Paste an Amazon.in, Flipkart, Croma, or JioMart product link — or try a sample below.'
      );
      return;
    }
    setUrlError(null);
    if (overrideUrl) setPastedUrl(overrideUrl);

    setAnalyzingStage(0);
    const matchedId = resolveProductFromUrl(targetUrl);

    setTimeout(() => setAnalyzingStage(1), 550);
    setTimeout(() => setAnalyzingStage(2), 1150);
    setTimeout(() => setAnalyzingStage(3), 1750);
    setTimeout(() => {
      setAnalyzingStage(null);
      onSelectProduct(matchedId);
    }, 2350);
  };

  const spotlightProducts = CATALOG_PRODUCTS.filter((p) => p.spotlightRank !== undefined).sort(
    (a, b) => (a.spotlightRank || 99) - (b.spotlightRank || 99)
  );

  return (
    <div className="bg-[#FFFDF7] text-[#241E14]">
      {/* =====================================================================
          1. COZY SUNLIT HERO + PROMINENT SEARCH BAR WITH HOVER EFFECT
         ===================================================================== */}
      <section className="bg-gradient-to-b from-[#FFF8DF] via-[#FFFDF7] to-white border-b border-[#EFE3B8]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10 lg:pt-14 lg:pb-12">
          <div className="max-w-4xl">
            <div className="mono-eyebrow text-[#855400] flex items-center gap-2 mb-3.5">
              <span className="inline-block w-2 h-2 rounded-[2px] bg-[#F5B800]" aria-hidden="true" />
              <span>INDIA TRUE-PRICE &amp; RETURN POLICY AUDIT · INR (₹)</span>
            </div>

            <h1 className="text-[36px] sm:text-[50px] lg:text-[64px] font-bold tracking-[-0.03em] leading-[1.05] text-[#241E14] [text-wrap:balance]">
              The price you see isn&rsquo;t the price you{' '}
              <span className="font-serif-italic font-medium text-[#9A6700]">pay</span>
              <span className="text-[#F5B800]">.</span>
            </h1>

            <p className="mt-4 text-[15px] sm:text-[17px] text-[#5C5240] max-w-2xl leading-relaxed">
              Compare the real checkout total across Amazon, Flipkart, Croma, Reliance Digital,
              JioMart, and brand stores — with every packaging fee, COD surcharge, bank offer, and
              return rule laid out clearly.
            </p>

            {/* COZY HERO SEARCH BAR WITH SMOOTH HOVER LIFT & GOLDEN HALO */}
            <div className="mt-7 max-w-2xl relative">
              <form
                onSubmit={handleHeroSearchSubmit}
                className="group relative flex items-center bg-white rounded-2xl border-2 border-[#E8D494] p-1.5 shadow-[0_6px_20px_-8px_rgba(180,130,0,0.18)] hover:-translate-y-0.5 hover:border-[#F5B800] hover:shadow-[0_14px_34px_-8px_rgba(245,184,0,0.42)] focus-within:-translate-y-0.5 focus-within:border-[#EAB308] focus-within:shadow-[0_14px_34px_-8px_rgba(245,184,0,0.45)] transition-all duration-200"
              >
                <div className="pl-3.5 pr-2 text-[#857861] group-hover:text-[#D99B00] group-focus-within:text-[#D99B00] transition-colors duration-200">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={heroSearchQuery}
                  onFocus={() => setIsHeroSearchOpen(true)}
                  onBlur={() => setTimeout(() => setIsHeroSearchOpen(false), 180)}
                  onChange={(e) => setHeroSearchQuery(e.target.value)}
                  placeholder="Search iPhone 16 Pro, MacBook Pro, Sony XM5, or any store..."
                  aria-label="Search products to compare true final price"
                  className="flex-1 h-11 bg-transparent text-[15px] text-[#241E14] placeholder-[#857861] outline-none min-w-0"
                />
                {heroSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setHeroSearchQuery('')}
                    aria-label="Clear search query"
                    className="p-2 text-[#857861] hover:text-[#241E14] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="h-11 px-5 sm:px-6 rounded-xl bg-[#F5B800] hover:bg-[#E5A900] text-[#241E14] font-mono text-[11px] font-bold uppercase tracking-[0.09em] transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 shadow-sm group-hover:shadow-md"
                >
                  <span>COMPARE</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>

              {/* Live Cozy Dropdown Suggestions */}
              {isHeroSearchOpen && (
                <div className="absolute left-0 right-0 top-[68px] bg-white border border-[#E6D496] rounded-2xl shadow-[0_18px_40px_-10px_rgba(36,30,20,0.16)] overflow-hidden z-30">
                  <div className="px-4 py-2 bg-[#FFF8DF] border-b border-[#EFE3B8] flex items-center justify-between">
                    <span className="mono-eyebrow text-[#855400] text-[10px]">
                      {heroSearchQuery.trim() ? 'MATCHING PRODUCTS' : 'TRENDING INDIAN AUDITS'}
                    </span>
                    <span className="font-mono text-[10px] text-[#857861]">CLICK TO COMPARE</span>
                  </div>
                  <div className="divide-y divide-[#F5ECCB]">
                    {heroMatches.map((product) => {
                      const { lowest } = getProductSpread(product, prefs);
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onMouseDown={() => onSelectProduct(product.id)}
                          className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-[#FFFDF2] transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-[#FFF8DF] border border-[#EFE3B8] overflow-hidden shrink-0">
                              <StudioImage
                                src={product.images[0]}
                                alt={product.shortName}
                                className="w-full h-full object-cover"
                                containerClassName="w-full h-full"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-[#241E14] truncate">
                                {product.shortName}
                              </p>
                              <p className="font-mono text-[10px] uppercase text-[#857861]">
                                {product.storesChecked} STORES · BEST ON {lowest.listing.storeName}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono text-sm font-bold text-[#9A6700] tabular-price shrink-0">
                            {formatINR(lowest.finalPayablePrice)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick search suggestions + methodology link */}
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#857861]">
                    POPULAR:
                  </span>
                  {[
                    { id: 'macbook-pro-16-m4', label: 'MacBook Pro 16"' },
                    { id: 'iphone-16-pro-256', label: 'iPhone 16 Pro' },
                    { id: 'sony-wh1000xm5', label: 'Sony WH-1000XM5' },
                    { id: 'breville-barista-express', label: 'Espresso Machine' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectProduct(item.id)}
                      className="px-2.5 py-1 rounded-full bg-white border border-[#EFE3B8] text-[#5C5240] hover:bg-[#FEF0B8] hover:border-[#EAB308] hover:text-[#241E14] transition-all duration-150 cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <MonoLink href="#how-we-calculate">SEE HOW WE CALCULATE</MonoLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. FEATURED STORY CAROUSEL (Warm framed banner on crisp white)
         ===================================================================== */}
      <section className="bg-white py-8 lg:py-10 border-b border-[#EFE3B8]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-[390px] sm:h-[440px] lg:h-[470px] rounded-2xl overflow-hidden border border-[#E6D496] shadow-[0_12px_32px_-12px_rgba(36,30,20,0.18)]">
            <StudioImage
              src={currentSlide.image}
              alt={currentSlide.headline}
              className="w-full h-full object-cover object-center transition-opacity duration-300"
              containerClassName="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#241E14]/90 via-[#241E14]/65 to-[#241E14]/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#241E14]/85 via-transparent to-transparent" />

            <div className="absolute inset-0 p-6 sm:p-8 lg:p-11 flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <EditorialBadge variant="green">{currentSlide.tag}</EditorialBadge>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-[#241E14] bg-[#FFF8DF]/95 px-3 py-1 rounded-md border border-[#E6D496] tabular-price">
                  <span className="inline-block w-1.5 h-1.5 rounded-[2px] bg-[#EAB308] mr-1.5 align-middle" />
                  {currentSlide.statLabel}
                </span>
              </div>

              <div className="max-w-2xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#FEF0B8] mb-2.5">
                  {currentSlide.subtitle}
                </p>
                <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-bold tracking-[-0.025em] leading-[1.12] text-white [text-wrap:balance] mb-5">
                  {currentSlide.headline}
                </h2>
                <button
                  type="button"
                  onClick={() => onSelectProduct(currentSlide.productId)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F5B800] hover:bg-[#FDE047] text-[#241E14] font-mono text-[11px] font-bold uppercase tracking-[0.09em] transition-colors cursor-pointer"
                >
                  <span>{currentSlide.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dash pagination + warm white arrow buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white/15">
                <div className="flex items-center gap-2" role="tablist" aria-label="Hero slides">
                  {HERO_SLIDES.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={idx === heroIndex}
                      aria-label={`Slide ${idx + 1}: ${s.tag}`}
                      onClick={() => setHeroIndex(idx)}
                      className={`h-[4px] rounded-full transition-all cursor-pointer ${
                        idx === heroIndex ? 'w-12 bg-[#F5B800]' : 'w-6 bg-white/40 hover:bg-white/75'
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-mono text-[11px] text-[#FEF0B8] tabular-price">
                    0{heroIndex + 1} / 0{HERO_SLIDES.length}
                  </span>
                </div>

                <CarouselArrows
                  onPrev={() =>
                    setHeroIndex((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                  }
                  onNext={() => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length)}
                  prevLabel="Previous hero story"
                  nextLabel="Next hero story"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. PASTE A PRODUCT LINK STRIP (Cozy Butter-Yellow #FFF8DF)
         ===================================================================== */}
      <section className="bg-[#FFF8DF] border-b border-[#EFE3B8]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="shrink-0">
              <div className="mono-eyebrow text-[#855400] flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5 text-[#D99B00]" />
                <span>PASTE ANY INDIAN STORE PRODUCT LINK</span>
              </div>
              <p className="text-xs text-[#5C5240] mt-1">
                Amazon.in, Flipkart, Croma, Reliance Digital, JioMart, or Apple India
              </p>
            </div>

            <form
              onSubmit={(e) => handleAnalyseLink(e)}
              className="flex-1 max-w-2xl flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={pastedUrl}
                onChange={(e) => {
                  setPastedUrl(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                disabled={analyzingStage !== null}
                placeholder="https://www.flipkart.com/apple-macbook-pro-16-m4-pro/p/..."
                aria-label="Paste a product link to analyse true final price"
                className="flex-1 h-11 px-4 bg-white border border-[#D9C37B] hover:border-[#EAB308] focus:border-[#D99B00] rounded-xl text-sm text-[#241E14] placeholder-[#857861] outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={analyzingStage !== null}
                className="h-11 px-6 bg-[#241E14] hover:bg-[#3A3122] text-[#FFFDF7] font-mono text-xs font-semibold uppercase tracking-[0.09em] rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {analyzingStage !== null ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F5B800]" />
                    <span>ANALYSING</span>
                  </>
                ) : (
                  <span>ANALYSE →</span>
                )}
              </button>
            </form>
          </div>

          {analyzingStage === null && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-mono">
              <span className="text-[#857861] uppercase">TRY SAMPLE LINK:</span>
              <button
                type="button"
                onClick={(e) =>
                  handleAnalyseLink(e, 'https://www.flipkart.com/apple-macbook-pro-16-m4-pro')
                }
                className="text-[#855400] hover:text-[#241E14] underline underline-offset-4 cursor-pointer"
              >
                flipkart.com/macbook-pro-16
              </button>
              <button
                type="button"
                onClick={(e) =>
                  handleAnalyseLink(e, 'https://www.amazon.in/dp/iphone-16-pro-256gb')
                }
                className="text-[#855400] hover:text-[#241E14] underline underline-offset-4 cursor-pointer"
              >
                amazon.in/iphone-16-pro
              </button>
              <button
                type="button"
                onClick={(e) =>
                  handleAnalyseLink(e, 'https://www.croma.com/sony-wh-1000xm5-anc')
                }
                className="text-[#855400] hover:text-[#241E14] underline underline-offset-4 cursor-pointer"
              >
                croma.com/sony-wh-1000xm5
              </button>
            </div>
          )}

          {urlError && (
            <p className="mt-2.5 text-xs font-mono text-[#B91C1C]" role="alert">
              {urlError}
            </p>
          )}

          {analyzingStage !== null && (
            <div
              className="mt-4 p-4 bg-white rounded-xl border border-[#E6D496]"
              role="status"
              aria-live="polite"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {ANALYSIS_STAGES.map((stage, idx) => {
                  const done = idx < analyzingStage;
                  const active = idx === analyzingStage;
                  return (
                    <div
                      key={stage}
                      className={`flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider py-2 px-3 rounded-lg border ${
                        done
                          ? 'border-[#15803D]/35 bg-[#ECFDF3] text-[#15803D]'
                          : active
                          ? 'border-[#F5B800] bg-[#FEF0B8] text-[#241E14] font-bold'
                          : 'border-[#EFE3B8] bg-[#FFFDF7] text-[#857861]'
                      }`}
                    >
                      {done ? (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      ) : active ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-[#9A6700]" />
                      ) : (
                        <span className="w-3.5 text-center">0{idx + 1}</span>
                      )}
                      <span className="truncate">{stage}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          4. FRESHLY RE-CHECKED CAROUSEL (White section)
         ===================================================================== */}
      <section className="bg-white py-14 lg:py-16 border-b border-[#EFE3B8]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="LIVE FEE AUDIT LOG"
            title="Freshly re-checked"
            subtitle="Every checkout screen re-verified across Indian marketplaces, brand stores, and bank offer terms."
            rightSlot={
              <CarouselArrows
                onPrev={() => scrollTrack(freshlyScrollRef, -1)}
                onNext={() => scrollTrack(freshlyScrollRef, 1)}
                prevLabel="Scroll freshly checked left"
                nextLabel="Scroll freshly checked right"
              />
            }
          />

          <div
            ref={freshlyScrollRef}
            className="flex gap-5 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory"
          >
            {CATALOG_PRODUCTS.map((product) => {
              const { lowest } = getProductSpread(product, prefs);
              return (
                <article
                  key={product.id}
                  onClick={() => onSelectProduct(product.id)}
                  className="min-w-[290px] sm:min-w-[330px] max-w-[330px] snap-start bg-white rounded-2xl border border-[#EFE3B8] hover:border-[#F5B800] hover:shadow-[0_10px_28px_-10px_rgba(234,179,8,0.28)] overflow-hidden flex flex-col cursor-pointer group hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="relative aspect-[4/3] bg-[#FFF8DF] overflow-hidden border-b border-[#EFE3B8]">
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
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#857861]">
                        {product.storesChecked} STORES · {product.feesChecked} FEES CHECKED
                      </p>
                      <h3 className="mt-1.5 text-[16px] font-bold leading-snug text-[#241E14] group-hover:text-[#9A6700] transition-colors">
                        {product.shortName}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-[#F5ECCB] flex items-end justify-between">
                      <div>
                        <span className="block font-mono text-[10px] uppercase tracking-wider text-[#857861]">
                          BEST TRUE PRICE
                        </span>
                        <span className="font-mono text-[18px] font-bold text-[#241E14] tabular-price">
                          {formatINR(lowest.finalPayablePrice)}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#9A6700]">
                        {lowest.listing.storeName} →
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. BIGGEST GAPS THIS WEEK (Warm Cream #FFFDF7)
         ===================================================================== */}
      <section className="bg-[#FFFDF7] py-14 lg:py-16 border-b border-[#EFE3B8]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="CHECKOUT SPREAD TRACKER"
            title="Biggest gaps this week"
            subtitle="Same exact Indian-warranty product, vastly different final rupee totals after hidden fees and card offers."
            rightSlot={
              <CarouselArrows
                onPrev={() => scrollTrack(gapsScrollRef, -1)}
                onNext={() => scrollTrack(gapsScrollRef, 1)}
                prevLabel="Scroll price gaps left"
                nextLabel="Scroll price gaps right"
              />
            }
          />

          <div
            ref={gapsScrollRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {CATALOG_PRODUCTS.slice(0, 3).map((product) => {
              const { lowest, highest, spread } = getProductSpread(product, prefs);
              const spreadPct = Math.min(
                100,
                Math.max(18, Math.round((spread / highest.finalPayablePrice) * 400))
              );
              return (
                <article
                  key={product.id}
                  onClick={() => onSelectProduct(product.id)}
                  className="bg-white rounded-2xl border border-[#EFE3B8] hover:border-[#F5B800] hover:shadow-[0_10px_28px_-10px_rgba(234,179,8,0.25)] p-5 flex flex-col justify-between gap-5 cursor-pointer group transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-xl bg-[#FFF8DF] border border-[#EFE3B8] shrink-0 overflow-hidden">
                      <StudioImage
                        src={product.images[0]}
                        alt={product.shortName}
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <EditorialBadge variant="green">
                        {formatINR(spread)} GAP
                      </EditorialBadge>
                      <h3 className="mt-2 text-[15px] font-bold text-[#241E14] leading-snug group-hover:text-[#9A6700] transition-colors">
                        {product.shortName}
                      </h3>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#857861]">
                        {product.storesChecked} STORES COMPARED
                      </p>
                    </div>
                  </div>

                  {/* Visual spread bar */}
                  <div className="space-y-2.5 pt-3 border-t border-[#F5ECCB]">
                    <div className="flex items-baseline justify-between text-xs">
                      <div>
                        <span className="block font-mono text-[10px] uppercase text-[#15803D] font-semibold">
                          LOWEST · {lowest.listing.storeName}
                        </span>
                        <span className="font-mono text-[16px] font-bold text-[#241E14] tabular-price">
                          {formatINR(lowest.finalPayablePrice)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block font-mono text-[10px] uppercase text-[#B91C1C] font-semibold">
                          HIGHEST · {highest.listing.storeName}
                        </span>
                        <span className="font-mono text-[15px] font-semibold text-[#5C5240] tabular-price">
                          {formatINR(highest.finalPayablePrice)}
                        </span>
                      </div>
                    </div>

                    <div className="h-2.5 w-full rounded-full bg-[#FFF8DF] border border-[#EFE3B8] relative overflow-hidden">
                      <div
                        className="h-full bg-[#F5B800] rounded-l-full"
                        style={{ width: `${100 - spreadPct}%` }}
                      />
                      <div
                        className="absolute top-0 right-0 h-full bg-[#D97706]"
                        style={{ width: `${spreadPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#5C5240]">
                        Includes fees, packaging &amp; card offers
                      </span>
                      <span className="font-mono text-[10px] font-semibold uppercase text-[#9A6700]">
                        INSPECT →
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. BROWSE BY CATEGORY (White section · Warm studio tiles)
         ===================================================================== */}
      <section className="bg-white py-14 lg:py-16 border-b border-[#EFE3B8]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="DIRECTORY BY PRODUCT TYPE"
            title="Browse by category"
            subtitle="Inspect real checkout fee averages and store return scores across major Indian categories."
            rightSlot={
              <MonoLink onClick={() => onSelectCategory('all')}>
                SEE ALL CATEGORIES
              </MonoLink>
            }
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORY_TILES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className="text-left rounded-2xl border border-[#EFE3B8] bg-[#FFF8DF] flex flex-col overflow-hidden group cursor-pointer hover:border-[#F5B800] hover:shadow-[0_10px_24px_-10px_rgba(234,179,8,0.3)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#FFF8DF]">
                  <StudioImage
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-200"
                    containerClassName="w-full h-full"
                  />
                </div>
                <div className="p-3 bg-white border-t border-[#EFE3B8] flex-1 flex flex-col justify-between">
                  <span className="text-[13.5px] font-bold text-[#241E14] group-hover:text-[#9A6700] transition-colors">
                    {cat.name}
                  </span>
                  <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#857861]">
                    <span>{cat.count} AUDITED</span>
                    <span className="text-[#9A6700]">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          7. COZY SUNBEAM-YELLOW SPOTLIGHT SECTION (#FEF0B8 with crisp white cards #1–#5)
         ===================================================================== */}
      <section className="bg-[#FEF0B8] text-[#241E14] py-16 lg:py-20 border-b border-[#E6D496]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="SPOTLIGHT · ELECTRONICS"
            title="Top audited electronics right now"
            subtitle="Ranked by verified lowest true payable price and store return-policy fairness across India."
            rightSlot={
              <MonoLink tone="dark" onClick={() => onSelectCategory('all')}>
                VIEW ALL ELECTRONICS
              </MonoLink>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {spotlightProducts.map((product) => {
              const { lowest, maxTrust } = getProductSpread(product, prefs);
              return (
                <article
                  key={product.id}
                  onClick={() => onSelectProduct(product.id)}
                  className="bg-white text-[#241E14] rounded-2xl border border-[#E6D496] hover:border-[#241E14] shadow-sm hover:shadow-[0_12px_28px_-10px_rgba(36,30,20,0.16)] overflow-hidden flex flex-col relative cursor-pointer group hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Warm honey rank badge */}
                  <div className="absolute top-2.5 left-2.5 z-10 bg-[#241E14] text-[#FDE047] rounded-md font-mono text-[11px] font-bold px-2 py-0.5">
                    #{product.spotlightRank}
                  </div>

                  <div className="aspect-[4/3] bg-[#FFF8DF] overflow-hidden border-b border-[#F5ECCB]">
                    <StudioImage
                      src={product.images[0]}
                      alt={product.shortName}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                      containerClassName="w-full h-full"
                    />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#857861]">
                        {product.brand} · {lowest.listing.storeName}
                      </span>
                      <h3 className="mt-1 text-[14px] font-bold text-[#241E14] leading-snug group-hover:text-[#9A6700] transition-colors">
                        {product.shortName}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-[#F5ECCB] space-y-1.5">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-[19px] font-bold text-[#241E14] tabular-price">
                          {formatINR(lowest.finalPayablePrice)}
                        </span>
                        <span className="font-mono text-[11px] text-[#857861] line-through tabular-price">
                          {formatINR(lowest.listing.mrp)}
                        </span>
                      </div>

                      <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#15803D]">
                        ■ TRUST SCORE {maxTrust}/100
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. HOW WE CALCULATE (3-step explainer) + FAQ (Crisp White)
         ===================================================================== */}
      <section id="how-we-calculate" className="bg-white py-16 lg:py-20 border-b border-[#EFE3B8]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="METHODOLOGY · ZERO SPONSORED RANKINGS"
            title="How we calculate true payable cost"
            subtitle="Every comparison follows a strict 3-step audit so unknown fees are never silently treated as ₹0."
            rightSlot={
              <MonoLink onClick={onOpenDiagnostics}>
                INSPECT DATA SOURCES
              </MonoLink>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                num: '01',
                title: 'Start with real checkout math',
                body: 'We begin from each store’s live listed price, apply only eligible bank offers and coupons you actually hold, and add mandatory packaging, handling, COD, platform, installation, and EMI processing GST.',
              },
              {
                num: '02',
                title: 'Flag hidden checkout charges',
                body: 'Fees that only appear on the payment screen — like Secured Packaging (₹199), Protect Promise (₹49–₹99), or pre-checked resQ handling — are isolated with an amber ⚠ HIDDEN tag and source citation.',
              },
              {
                num: '03',
                title: 'Audit return & refund reality',
                body: 'A cheaper laptop isn’t a bargain if returns require a brand DOA certificate or refund only to wallet credit. We score every store’s return window, shipping payer, and restocking rules side by side.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="p-6 lg:p-7 rounded-2xl border border-[#EFE3B8] bg-[#FFFDF7] flex flex-col justify-between gap-4"
              >
                <span className="inline-flex w-10 h-10 rounded-xl bg-[#FEF0B8] text-[#855400] font-mono text-base font-bold items-center justify-center">
                  {step.num}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[#241E14] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#5C5240] leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <div className="mono-eyebrow text-[#855400] flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-[2px] bg-[#F5B800]" />
                <span>FREQUENT QUESTIONS</span>
              </div>
              <h3 className="text-2xl font-bold tracking-[-0.02em] text-[#241E14]">
                What shoppers ask before buying
              </h3>
              <p className="mt-2 text-sm text-[#5C5240] leading-relaxed">
                Have a question about a specific store’s hidden fees or GST invoice rules?
              </p>
              <button
                type="button"
                onClick={onOpenAiAssistant}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5B800] hover:bg-[#E5A900] text-[#241E14] font-mono text-[11px] font-bold uppercase tracking-[0.09em] transition-colors cursor-pointer"
              >
                <span>✦ ASK PRICEPROOF AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="lg:col-span-8 border-t border-[#EFE3B8]">
              {FAQ_ITEMS.map((item, idx) => {
                const open = openFaqIndex === idx;
                return (
                  <div key={item.q} className="border-b border-[#EFE3B8]">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(open ? null : idx)}
                      aria-expanded={open}
                      className="w-full py-5 flex items-center justify-between gap-4 text-left cursor-pointer group"
                    >
                      <span className="text-[15px] font-bold text-[#241E14] group-hover:text-[#9A6700] transition-colors">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#855400] shrink-0 transition-transform duration-150 ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {open && (
                      <p className="pb-5 text-sm text-[#5C5240] leading-relaxed max-w-2xl">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
