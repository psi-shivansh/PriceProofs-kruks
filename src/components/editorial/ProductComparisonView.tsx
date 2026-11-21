import React, { useState, useMemo, useRef } from 'react';
import {
  ArrowUpRight,
  Share2,
  Check,
  Flag,
  MapPin,
  CreditCard,
  Layers,
  Loader2,
  AlertTriangle,
  Sparkles,
  X,
} from 'lucide-react';
import {
  CatalogProduct,
  PaymentBank,
  SortKey,
  UserPricePreferences,
  computeProductOffers,
  getPincodeMeta,
} from '../../data/indianCatalog.ts';
import { formatINR } from '../../core/formatters.ts';
import {
  AnimatedINR,
  EditorialBadge,
  MonoLink,
  StoreMonogram,
  StudioImage,
} from './Primitives.tsx';
import {
  PriceHistoryMiniChart,
  PriceWaterfallSection,
  ReturnPolicyMatrixSection,
} from './WaterfallAndPolicy.tsx';
import { CompareStoresDrawer } from './CompareStoresDrawer.tsx';

type ProductTab = '01' | '02' | '03' | '04';

interface ProductComparisonViewProps {
  product: CatalogProduct;
  prefs: UserPricePreferences;
  onUpdatePrefs: (patch: Partial<UserPricePreferences>) => void;
  onNavigateHome: () => void;
  onNavigateCategory: (categoryId: string) => void;
  existingAlertPrice?: number;
  onSetPriceAlert: (productId: string, productName: string, targetPrice: number) => void;
}

const BANK_OPTIONS: Array<{ value: PaymentBank; label: string }> = [
  { value: 'NONE', label: 'No Bank Card' },
  { value: 'HDFC', label: 'HDFC Credit Card' },
  { value: 'ICICI', label: 'ICICI Credit Card' },
  { value: 'SBI', label: 'SBI Card' },
  { value: 'AXIS', label: 'Axis Bank Card' },
  { value: 'UPI', label: 'UPI / SuperCoin' },
];

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'FINAL_PRICE', label: 'Lowest final price' },
  { value: 'FASTEST_DELIVERY', label: 'Fastest delivery' },
  { value: 'BEST_RETURN', label: 'Best return policy' },
  { value: 'FEWEST_HIDDEN_FEES', label: 'Fewest hidden fees' },
];

export const ProductComparisonView: React.FC<ProductComparisonViewProps> = ({
  product,
  prefs,
  onUpdatePrefs,
  onNavigateHome,
  onNavigateCategory,
  existingAlertPrice,
  onSetPriceAlert,
}) => {
  const [activeTab, setActiveTab] = useState<ProductTab>('01');
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [sortBy, setSortBy] = useState<SortKey>('FINAL_PRICE');
  const [selectedCompareStoreIds, setSelectedCompareStoreIds] = useState<string[]>(() =>
    product.listings
      .filter((l) => l.inStock)
      .slice(0, 3)
      .map((l) => l.storeId)
  );
  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);

  const [shareCopied, setShareCopied] = useState(false);
  const [reportingStoreName, setReportingStoreName] = useState<string | null>(null);
  const [reportNote, setReportNote] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [inlineAiAnswer, setInlineAiAnswer] = useState<string | null>(null);
  const [inlineAiError, setInlineAiError] = useState<string | null>(null);
  const [isInlineAiLoading, setIsInlineAiLoading] = useState(false);

  const tabsAnchorRef = useRef<HTMLDivElement | null>(null);

  const computedOffers = useMemo(
    () => computeProductOffers(product, prefs, sortBy),
    [product, prefs, sortBy]
  );

  const bestOffer = useMemo(
    () =>
      computedOffers.find((o) => o.isBestPrice) ||
      computedOffers.find((o) => o.listing.inStock) ||
      computedOffers[0],
    [computedOffers]
  );

  const pincodeMeta = useMemo(() => getPincodeMeta(prefs.pincode), [prefs.pincode]);

  const compareSelectedOffers = useMemo(
    () => computedOffers.filter((o) => selectedCompareStoreIds.includes(o.listing.storeId)),
    [computedOffers, selectedCompareStoreIds]
  );

  const toggleStoreForCompare = (storeId: string) => {
    setSelectedCompareStoreIds((prev) => {
      if (prev.includes(storeId)) {
        return prev.filter((id) => id !== storeId);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), storeId];
      }
      return [...prev, storeId];
    });
  };

  const handleShareComparison = async () => {
    const summaryText = `PriceProof True Price Audit — ${product.shortName}\nBest Final Price: ${formatINR(
      bestOffer.finalPayablePrice
    )} on ${bestOffer.listing.storeName} (Pincode ${prefs.pincode}, Card: ${prefs.bankCard})\nVerdict: ${product.verdictQuote}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(summaryText);
      }
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleAskInlineQuestion = async (question: string) => {
    if (activeQuestion === question && inlineAiAnswer && !isInlineAiLoading) {
      setActiveQuestion(null);
      setInlineAiAnswer(null);
      setInlineAiError(null);
      return;
    }

    setActiveQuestion(question);
    setInlineAiAnswer(null);
    setInlineAiError(null);
    setIsInlineAiLoading(true);

    try {
      const offerContext = computedOffers.map((o) => ({
        title: product.name,
        sellerName: o.listing.storeName,
        basePrice: o.listedPrice,
        knownTotal: o.finalPayablePrice,
        stickerDelta: o.deltaVsListed,
        deliveryLabel: o.deliveryFee === 0 ? 'Free (₹0)' : formatINR(o.deliveryFee),
        mandatoryFeesTotal: o.totalFees,
        mandatoryFeeNames: o.activeFeeLines.map((f) => f.label),
        returnWindowDays: o.listing.returnPolicy.windowDays,
        isFreeReturn: o.listing.returnPolicy.returnShippingSignal === 'good',
        returnShippingCharge: o.listing.returnPolicy.returnShippingSignal === 'good' ? 0 : 249,
        restockingFeePercentage: o.listing.returnPolicy.restockingFeePercent,
        warrantyMonths: 12,
        warrantyCoverage: product.warrantyNote,
        transparencyGrade: o.listing.trustScore >= 85 ? 'A' : o.listing.trustScore >= 75 ? 'B' : 'C',
        completeness: o.listing.returnPolicy.policyFound ? 'COMPLETE' : 'PARTIAL_ESTIMATE',
        isCheapestComparable: o.isBestPrice,
        isDeceptiveSticker: o.hiddenFeesCount > 0 && !o.isBestPrice,
        isLive: false,
        providerName: 'PriceProof Audited Indian Store Catalog',
        warnings: [
          o.listing.returnPolicy.plainEnglishSummary,
          ...(o.hiddenFeesCount > 0
            ? [`${o.hiddenFeesCount} hidden checkout fees (+${formatINR(o.hiddenFeesTotal)})`]
            : []),
        ],
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${question} (Context: Indian pincode ${prefs.pincode}, bank card: ${prefs.bankCard}, COD toggle: ${
            prefs.includeCodFee ? 'ON' : 'OFF'
          }, payment mode: ${prefs.paymentMode}. Answer concisely in 2-4 crisp bullet points.)`,
          context: {
            query: product.name,
            totalOffers: computedOffers.length,
            offers: offerContext,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.reply) {
        throw new Error(data.error || 'Could not load AI analysis right now.');
      }
      setInlineAiAnswer(data.reply);
    } catch (err: unknown) {
      setInlineAiError(
        err instanceof Error ? err.message : 'Unable to fetch inline answer right now.'
      );
    } finally {
      setIsInlineAiLoading(false);
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportingStoreName(null);
      setReportNote('');
      setReportSubmitted(false);
    }, 1400);
  };

  const scrollToLeaderboard = () => {
    setActiveTab('01');
    tabsAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-[#FFFDF7] text-[#241E14] pb-24">
      {/* Breadcrumb Bar */}
      <div className="border-b border-[#EFE3B8] bg-[#FFF8DF]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Breadcrumb"
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.09em] text-[#855400] flex flex-wrap items-center gap-2"
          >
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-[#241E14] hover:underline cursor-pointer"
            >
              HOME
            </button>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              onClick={() => onNavigateCategory(product.categoryId)}
              className="hover:text-[#241E14] hover:underline cursor-pointer"
            >
              {product.categoryName}
            </button>
            <span aria-hidden="true">/</span>
            <span className="text-[#241E14]">{product.shortName}</span>
          </nav>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleShareComparison}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#241E14] hover:text-[#9A6700] cursor-pointer"
            >
              {shareCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#15803D]" />
                  <span className="text-[#15803D]">COMPARISON COPIED</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>SHARE COMPARISON</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setReportingStoreName(bestOffer.listing.storeName)}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#5C5240] hover:text-[#B91C1C] cursor-pointer"
            >
              <Flag className="w-3 h-3" />
              <span>REPORT INCORRECT PRICE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Product Overview */}
      <section className="bg-white border-b border-[#EFE3B8]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Vertical thumbnail rail + Large Studio Image */}
            <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-3">
              <div className="flex sm:flex-col gap-2.5 shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    aria-label={`View image ${idx + 1}`}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#FFF8DF] border overflow-hidden cursor-pointer transition-all ${
                      selectedImageIdx === idx
                        ? 'border-[#F5B800] ring-2 ring-[#F5B800]/50'
                        : 'border-[#EFE3B8] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <StudioImage
                      src={img}
                      alt={`${product.shortName} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full"
                    />
                  </button>
                ))}
              </div>

              <div className="flex-1 aspect-[4/3] rounded-2xl bg-[#FFF8DF] border border-[#EFE3B8] relative overflow-hidden">
                <StudioImage
                  src={product.images[selectedImageIdx] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full"
                />
                <div className="absolute top-3 left-3">
                  <EditorialBadge variant="dark" withGreenSquare>
                    VERIFIED {product.updatedAgo}
                  </EditorialBadge>
                </div>
              </div>
            </div>

            {/* Product Summary + Best True Price + Price History */}
            <div className="lg:col-span-6 space-y-5">
              <div>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-[#855400]">
                  {product.brand} · {product.storesChecked} INDIAN STORES · {product.feesChecked} FEES AUDITED
                </div>
                <h1 className="mt-1.5 text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-[-0.025em] leading-[1.14] text-[#241E14] [text-wrap:balance]">
                  {product.name}
                </h1>
              </div>

              <div className="p-5 rounded-2xl border border-[#E6D496] bg-[#FFFDF4]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <EditorialBadge variant="green-outline" withGreenSquare>
                    VERIFIED {bestOffer.listing.verifiedAgo}
                  </EditorialBadge>
                  <MonoLink onClick={() => setActiveTab('02')}>
                    SEE WHAT WE CHECKED
                  </MonoLink>
                </div>

                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#5C5240]">
                    BEST TRUE PRICE
                  </span>
                  <AnimatedINR
                    value={bestOffer.finalPayablePrice}
                    className="font-mono text-[32px] sm:text-[38px] font-bold text-[#241E14] leading-none"
                  />
                  {bestOffer.listing.mrp > bestOffer.finalPayablePrice && (
                    <span className="font-mono text-sm text-[#857861] line-through tabular-price">
                      {formatINR(bestOffer.listing.mrp)}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EFE3B8] text-xs">
                  <div className="text-[#5C5240]">
                    Winner:{' '}
                    <strong className="text-[#241E14]">{bestOffer.listing.storeName}</strong> ·{' '}
                    {prefs.paymentMode === 'EMI'
                      ? `Est. ${formatINR(bestOffer.monthlyEmi6m)}/mo (6m EMI)`
                      : `Includes ${formatINR(bestOffer.totalFees)} fees & −${formatINR(
                          bestOffer.totalOffersSavings
                        )} offers`}
                  </div>
                  <a
                    href={bestOffer.listing.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#F5B800] hover:bg-[#E5A900] text-[#241E14] font-mono text-[11px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>BUY FROM {bestOffer.listing.storeName}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <PriceHistoryMiniChart
                productId={product.id}
                productName={product.shortName}
                history={product.priceHistory}
                currentBestPrice={bestOffer.finalPayablePrice}
                existingAlertPrice={existingAlertPrice}
                onSetAlert={onSetPriceAlert}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Numbered Tabs Bar (sticky right beneath slim 48px GlobalNav -> top-12) */}
      <div
        ref={tabsAnchorRef}
        className="sticky top-12 z-30 bg-white/95 backdrop-blur-md border-b border-[#EFE3B8]"
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center" role="tablist" aria-label="Comparison sections">
            {(
              [
                { id: '01', label: 'TRUE PRICE' },
                { id: '02', label: 'FEES & OFFERS' },
                { id: '03', label: 'RETURNS & REFUNDS' },
                { id: '04', label: 'SPECS' },
              ] as const
            ).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-5 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.09em] border-b-[3px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-[#F5B800] text-[#241E14]'
                      : 'border-transparent text-[#857861] hover:text-[#241E14]'
                  }`}
                >
                  <span className={active ? 'text-[#9A6700] mr-1.5' : 'mr-1.5'}>
                    {tab.id}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {selectedCompareStoreIds.length >= 2 && (
            <button
              type="button"
              onClick={() => setIsCompareDrawerOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#241E14] text-[#FFFDF7] font-mono text-[10px] font-semibold uppercase tracking-wider hover:bg-[#F5B800] hover:text-[#241E14] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>COMPARE {selectedCompareStoreIds.length} STORES</span>
            </button>
          )}
        </div>
      </div>

      {/* Personalisation Controls Bar */}
      {activeTab !== '04' && (
        <div className="bg-[#FFF8DF] border-b border-[#EFE3B8]">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Pincode input */}
              <div className="flex items-center bg-white border border-[#D9C37B] hover:border-[#EAB308] rounded-xl px-3 h-10 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-[#D99B00] mr-1.5 shrink-0" />
                <label htmlFor="pincode-input" className="sr-only">
                  Indian Pincode
                </label>
                <input
                  id="pincode-input"
                  type="text"
                  maxLength={6}
                  value={prefs.pincode}
                  onChange={(e) =>
                    onUpdatePrefs({ pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })
                  }
                  placeholder="400001"
                  className="w-16 font-mono text-xs font-bold text-[#241E14] outline-none"
                />
                <span className="hidden sm:inline font-mono text-[10px] uppercase text-[#5C5240] border-l border-[#EFE3B8] pl-2 ml-1">
                  {pincodeMeta.cityLabel}
                </span>
              </div>

              {/* Bank Card Selector */}
              <div className="flex items-center bg-white border border-[#D9C37B] hover:border-[#EAB308] rounded-xl px-3 h-10 transition-colors">
                <CreditCard className="w-3.5 h-3.5 text-[#855400] mr-1.5 shrink-0" />
                <label htmlFor="bank-selector" className="sr-only">
                  Select Bank Card
                </label>
                <select
                  id="bank-selector"
                  value={prefs.bankCard}
                  onChange={(e) => onUpdatePrefs({ bankCard: e.target.value as PaymentBank })}
                  className="bg-transparent font-mono text-xs font-semibold text-[#241E14] outline-none cursor-pointer pr-1"
                >
                  {BANK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Include COD fee toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={prefs.includeCodFee}
                onClick={() => onUpdatePrefs({ includeCodFee: !prefs.includeCodFee })}
                className={`h-10 px-3.5 rounded-xl border font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  prefs.includeCodFee
                    ? 'bg-[#241E14] text-[#FDE047] border-[#241E14]'
                    : 'bg-white text-[#241E14] border-[#D9C37B] hover:bg-[#FEF0B8]'
                }`}
              >
                {prefs.includeCodFee ? '■ COD FEE INCLUDED' : '+ INCLUDE COD FEE'}
              </button>

              {/* Apply all coupons toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={prefs.applyAllCoupons}
                onClick={() => onUpdatePrefs({ applyAllCoupons: !prefs.applyAllCoupons })}
                className={`h-10 px-3.5 rounded-xl border font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  prefs.applyAllCoupons
                    ? 'bg-[#F5B800] text-[#241E14] border-[#DDA300]'
                    : 'bg-white text-[#241E14] border-[#D9C37B] hover:bg-[#FEF0B8]'
                }`}
              >
                {prefs.applyAllCoupons ? '■ ALL COUPONS APPLIED' : 'APPLY ALL COUPONS'}
              </button>

              {/* Full Payment vs EMI */}
              <div className="inline-flex rounded-xl overflow-hidden border border-[#D9C37B] bg-white h-10">
                <button
                  type="button"
                  onClick={() => onUpdatePrefs({ paymentMode: 'FULL' })}
                  className={`px-3.5 font-mono text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
                    prefs.paymentMode === 'FULL'
                      ? 'bg-[#241E14] text-white'
                      : 'text-[#5C5240] hover:text-[#241E14]'
                  }`}
                >
                  FULL
                </button>
                <button
                  type="button"
                  onClick={() => onUpdatePrefs({ paymentMode: 'EMI' })}
                  className={`px-3.5 font-mono text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-colors border-l border-[#D9C37B] ${
                    prefs.paymentMode === 'EMI'
                      ? 'bg-[#241E14] text-white'
                      : 'text-[#5C5240] hover:text-[#241E14]'
                  }`}
                >
                  EMI (6M)
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase text-[#5C5240]">
                <span>TEST ZONE:</span>
                {[
                  { pin: '400001', label: 'Mumbai' },
                  { pin: '560001', label: 'Bengaluru' },
                  { pin: '781001', label: 'Guwahati (+Remote)' },
                ].map((z) => (
                  <button
                    key={z.pin}
                    type="button"
                    onClick={() => onUpdatePrefs({ pincode: z.pin })}
                    className={`underline underline-offset-4 cursor-pointer ${
                      prefs.pincode === z.pin
                        ? 'text-[#9A6700] font-bold'
                        : 'text-[#5C5240] hover:text-[#241E14]'
                    }`}
                  >
                    {z.pin} {z.label}
                  </button>
                ))}
                <span className="hidden md:inline text-[#857861]">
                  · {pincodeMeta.stateTaxNote}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[10px] uppercase text-[#5C5240] mr-1">
                  SORT BY:
                </span>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSortBy(opt.value)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
                      sortBy === opt.value
                        ? 'bg-[#241E14] text-[#FDE047] border-[#241E14]'
                        : 'bg-white text-[#5C5240] border-[#EFE3B8] hover:border-[#EAB308] hover:text-[#241E14]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Container */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {activeTab === '01' && (
          <div className="space-y-8">
            {/* Pull-Quote Verdict */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-8 border-b border-[#EFE3B8]">
              <div className="lg:col-span-8">
                <div className="mono-eyebrow text-[#855400] mb-2">PRICEPROOF VERDICT</div>
                <blockquote className="relative pl-0">
                  <span
                    aria-hidden="true"
                    className="font-serif-italic text-5xl sm:text-6xl text-[#EAB308] leading-none block -mb-3"
                  >
                    &ldquo;
                  </span>
                  <p className="text-xl sm:text-2xl lg:text-[27px] font-bold tracking-[-0.02em] leading-[1.24] text-[#241E14] [text-wrap:balance]">
                    {product.verdictQuote}
                  </p>
                </blockquote>
                <p className="mt-3 text-sm text-[#5C5240] leading-relaxed max-w-2xl">
                  {product.verdictSummary}
                </p>
              </div>

              <div className="lg:col-span-4 rounded-2xl border border-[#E6D496] bg-[#FFF8DF] p-5 space-y-3">
                <div className="mono-eyebrow text-[#241E14] flex items-center justify-between">
                  <span>SIDE-BY-SIDE COMPARE</span>
                  <span className="text-[#855400]">
                    {selectedCompareStoreIds.length}/4 SELECTED
                  </span>
                </div>
                <p className="text-xs text-[#5C5240] leading-relaxed">
                  Check 2 to 4 stores in the leaderboard below to inspect hidden fee &amp; return
                  differences side by side.
                </p>
                <button
                  type="button"
                  disabled={selectedCompareStoreIds.length < 2}
                  onClick={() => setIsCompareDrawerOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-[#241E14] text-[#FFFDF7] font-mono text-[11px] font-semibold uppercase tracking-wider hover:bg-[#F5B800] hover:text-[#241E14] disabled:opacity-40 transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>OPEN COMPARE TABLE ({selectedCompareStoreIds.length})</span>
                </button>
              </div>
            </div>

            {/* Desktop Leaderboard Table */}
            <div className="hidden lg:block rounded-2xl border border-[#E6D496] overflow-hidden bg-white shadow-sm">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#FEF0B8] text-[#241E14] font-mono text-[10px] uppercase tracking-[0.09em] border-b border-[#E6D496]">
                    <th className="py-3.5 px-4 w-10">CMP</th>
                    <th className="py-3.5 px-4">Store</th>
                    <th className="py-3.5 px-3 text-right">Listed Price</th>
                    <th className="py-3.5 px-3 text-right">Total Fees</th>
                    <th className="py-3.5 px-3 text-right">Offers Applied</th>
                    <th className="py-3.5 px-4 text-right">Final Price</th>
                    <th className="py-3.5 px-3">Delivery</th>
                    <th className="py-3.5 px-3">Return Window</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5ECCB]">
                  {computedOffers.map((offer) => {
                    const isChecked = selectedCompareStoreIds.includes(offer.listing.storeId);
                    const isOos = !offer.listing.inStock;

                    return (
                      <tr
                        key={offer.listing.storeId}
                        className={`${
                          offer.isBestPrice
                            ? 'bg-[#FFFDF0]'
                            : isOos
                            ? 'bg-[#FAF8F2] opacity-75'
                            : 'bg-white hover:bg-[#FFFDF7]'
                        } transition-colors`}
                      >
                        <td className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleStoreForCompare(offer.listing.storeId)}
                            aria-label={`Select ${offer.listing.storeName} for side-by-side comparison`}
                            className="w-4 h-4 accent-[#D99B00] cursor-pointer"
                          />
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <StoreMonogram
                              shortCode={offer.listing.shortCode}
                              bg={offer.listing.storeAccentBg}
                              text={offer.listing.storeAccentText}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-bold text-[#241E14]">
                                  {offer.listing.storeName}
                                </span>
                                {offer.isBestPrice && (
                                  <EditorialBadge variant="green">BEST</EditorialBadge>
                                )}
                                {isOos && (
                                  <EditorialBadge variant="red">OUT OF STOCK</EditorialBadge>
                                )}
                              </div>
                              <div className="font-mono text-[10px] uppercase tracking-wider text-[#857861] mt-0.5">
                                TRUST {offer.listing.trustScore}/100 · VERIFIED {offer.listing.verifiedAgo}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-3 text-right font-mono text-[13px] text-[#5C5240] tabular-price">
                          {formatINR(offer.listedPrice)}
                        </td>

                        <td className="py-4 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveTab('02')}
                            className="text-right cursor-pointer group"
                          >
                            <span
                              className={`block font-mono text-[13px] font-semibold tabular-price ${
                                offer.totalFees > 0 ? 'text-[#B45309]' : 'text-[#15803D]'
                              }`}
                            >
                              {offer.totalFees > 0 ? `+${formatINR(offer.totalFees)}` : '₹0'}
                            </span>
                            {offer.hiddenFeesCount > 0 ? (
                              <span className="block font-mono text-[9px] uppercase text-[#B45309] group-hover:underline">
                                ⚠ {offer.hiddenFeesCount} HIDDEN
                              </span>
                            ) : (
                              <span className="block font-mono text-[9px] uppercase text-[#857861]">
                                NO HIDDEN FEES
                              </span>
                            )}
                          </button>
                        </td>

                        <td className="py-4 px-3 text-right">
                          {offer.totalOffersSavings > 0 ? (
                            <div>
                              <span className="block font-mono text-[13px] font-bold text-[#15803D] tabular-price">
                                −{formatINR(offer.totalOffersSavings)}
                              </span>
                              <span className="block font-mono text-[9px] uppercase text-[#857861] truncate max-w-[140px] ml-auto">
                                {offer.appliedBankOffer
                                  ? `${offer.appliedBankOffer.bank} + COUPON`
                                  : 'COUPON'}
                              </span>
                            </div>
                          ) : (
                            <span className="font-mono text-xs text-[#857861]">—</span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <AnimatedINR
                            value={offer.finalPayablePrice}
                            className="font-mono text-[18px] font-bold text-[#241E14]"
                          />
                          {prefs.paymentMode === 'EMI' && (
                            <span className="block font-mono text-[10px] text-[#5C5240] tabular-price">
                              {formatINR(offer.monthlyEmi6m)}/mo × 6
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-3">
                          <span
                            className={`block text-xs font-semibold ${
                              isOos ? 'text-[#B91C1C]' : 'text-[#241E14]'
                            }`}
                          >
                            {offer.estimatedDeliveryLabel}
                          </span>
                          <span className="block text-[11px] text-[#857861] truncate max-w-[160px]">
                            {isOos ? offer.listing.stockNote : offer.listing.deliveryNote}
                          </span>
                        </td>

                        <td className="py-4 px-3">
                          <button
                            type="button"
                            onClick={() => setActiveTab('03')}
                            className="text-left cursor-pointer group"
                          >
                            <span
                              className={`block text-xs font-bold ${
                                offer.listing.returnPolicy.windowSignal === 'good'
                                  ? 'text-[#15803D]'
                                  : offer.listing.returnPolicy.windowSignal === 'bad'
                                  ? 'text-[#B91C1C]'
                                  : 'text-[#B45309]'
                              }`}
                            >
                              {offer.listing.returnPolicy.windowLabel}
                            </span>
                            <span className="block text-[11px] text-[#5C5240] group-hover:underline truncate max-w-[155px]">
                              {offer.listing.returnPolicy.refundMethod}
                            </span>
                          </button>
                        </td>

                        <td className="py-4 px-4 text-right">
                          {isOos ? (
                            <span className="inline-block px-3 py-1.5 rounded-lg font-mono text-[10px] font-semibold uppercase tracking-wider text-[#857861] border border-[#EFE3B8]">
                              UNAVAILABLE
                            </span>
                          ) : (
                            <div className="flex flex-col items-end gap-1">
                              <a
                                href={offer.listing.productUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`px-3.5 py-2 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
                                  offer.isBestPrice
                                    ? 'bg-[#F5B800] text-[#241E14] hover:bg-[#E5A900]'
                                    : 'bg-white text-[#241E14] border border-[#D9C37B] hover:bg-[#FEF0B8]'
                                }`}
                              >
                                <span>BUY</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </a>
                              <button
                                type="button"
                                onClick={() => setReportingStoreName(offer.listing.storeName)}
                                className="font-mono text-[9px] uppercase text-[#857861] hover:text-[#B91C1C] cursor-pointer"
                              >
                                Report error
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Swipeable Cards */}
            <div className="lg:hidden space-y-3">
              <div className="flex items-center justify-between">
                <span className="mono-eyebrow text-[#855400]">
                  SWIPE STORES ({computedOffers.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsCompareDrawerOpen(true)}
                  className="font-mono text-[10px] font-bold uppercase text-[#9A6700] underline cursor-pointer"
                >
                  COMPARE ({selectedCompareStoreIds.length})
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
                {computedOffers.map((offer) => {
                  const isChecked = selectedCompareStoreIds.includes(offer.listing.storeId);
                  return (
                    <div
                      key={offer.listing.storeId}
                      className={`min-w-[290px] max-w-[310px] snap-start rounded-2xl border p-4 flex flex-col justify-between gap-4 ${
                        offer.isBestPrice
                          ? 'border-[#F5B800] bg-[#FFFDF0]'
                          : 'border-[#EFE3B8] bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <StoreMonogram
                            shortCode={offer.listing.shortCode}
                            bg={offer.listing.storeAccentBg}
                            text={offer.listing.storeAccentText}
                            size="sm"
                          />
                          <div>
                            <h3 className="text-sm font-bold text-[#241E14]">
                              {offer.listing.storeName}
                            </h3>
                            <span className="font-mono text-[10px] text-[#857861]">
                              TRUST {offer.listing.trustScore}/100
                            </span>
                          </div>
                        </div>
                        {offer.isBestPrice && <EditorialBadge variant="green">BEST</EditorialBadge>}
                        {!offer.listing.inStock && (
                          <EditorialBadge variant="red">OUT OF STOCK</EditorialBadge>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs border-y border-[#F5ECCB] py-3">
                        <div className="flex justify-between">
                          <span className="text-[#5C5240]">Listed price</span>
                          <span className="font-mono tabular-price">{formatINR(offer.listedPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5C5240]">Total fees</span>
                          <span className="font-mono text-[#B45309] tabular-price">
                            +{formatINR(offer.totalFees)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5C5240]">Offers applied</span>
                          <span className="font-mono text-[#15803D] tabular-price">
                            −{formatINR(offer.totalOffersSavings)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-[#F5ECCB] items-baseline">
                          <span className="font-mono text-[10px] font-bold uppercase text-[#241E14]">
                            FINAL PRICE
                          </span>
                          <AnimatedINR
                            value={offer.finalPayablePrice}
                            className="font-mono text-lg font-bold text-[#241E14]"
                          />
                        </div>
                      </div>

                      <div className="text-xs space-y-1 text-[#5C5240]">
                        <div>
                          Delivery:{' '}
                          <strong className="text-[#241E14]">{offer.estimatedDeliveryLabel}</strong>
                        </div>
                        <div>
                          Return:{' '}
                          <strong className="text-[#241E14]">
                            {offer.listing.returnPolicy.windowLabel}
                          </strong>{' '}
                          · {offer.listing.returnPolicy.refundMethod}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleStoreForCompare(offer.listing.storeId)}
                          className={`px-3 py-2 rounded-lg border font-mono text-[10px] font-semibold uppercase cursor-pointer ${
                            isChecked
                              ? 'bg-[#241E14] text-[#FDE047] border-[#241E14]'
                              : 'bg-white text-[#241E14] border-[#D9C37B]'
                          }`}
                        >
                          {isChecked ? '✓ COMPARED' : '+ COMPARE'}
                        </button>
                        {offer.listing.inStock && (
                          <a
                            href={offer.listing.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 rounded-lg bg-[#F5B800] text-[#241E14] font-mono text-[10px] font-bold uppercase text-center hover:bg-[#E5A900]"
                          >
                            BUY ↗
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expandable "Ask about this" chips */}
            <div className="rounded-2xl border border-[#E6D496] bg-[#FFF8DF] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="mono-eyebrow text-[#855400] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D99B00]" />
                  <span>ASK ABOUT THIS COMPARISON</span>
                </div>
                <span className="font-mono text-[10px] uppercase text-[#857861]">
                  POWERED BY LIVE PRICEPROOF AI
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.askQuestions.map((q) => {
                  const isActive = activeQuestion === q;
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleAskInlineQuestion(q)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#241E14] text-[#FDE047] border-[#241E14]'
                          : 'bg-white text-[#241E14] border-[#E6D496] hover:border-[#F5B800] hover:bg-[#FEF0B8]'
                      }`}
                    >
                      {q}
                    </button>
                  );
                })}
              </div>

              {activeQuestion && (
                <div className="mt-4 p-4 rounded-xl bg-white border border-[#E6D496]">
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#F5ECCB]">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#9A6700]">
                      ■ AI ANSWER · {activeQuestion}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveQuestion(null);
                        setInlineAiAnswer(null);
                        setInlineAiError(null);
                      }}
                      aria-label="Close inline AI answer"
                      className="text-[#857861] hover:text-[#241E14] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isInlineAiLoading ? (
                    <div className="flex items-center gap-2 text-xs font-mono text-[#5C5240] py-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D99B00]" />
                      <span>Auditing store fees and return terms...</span>
                    </div>
                  ) : inlineAiError ? (
                    <div className="text-xs text-[#B91C1C] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{inlineAiError}</span>
                    </div>
                  ) : (
                    <div className="text-sm text-[#241E14] leading-relaxed whitespace-pre-line">
                      {inlineAiAnswer}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === '02' && <PriceWaterfallSection offers={computedOffers} />}

        {activeTab === '03' && <ReturnPolicyMatrixSection offers={computedOffers} />}

        {activeTab === '04' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 rounded-2xl border border-[#E6D496] bg-white overflow-hidden">
              <div className="px-5 py-3.5 bg-[#FEF0B8] text-[#241E14] mono-eyebrow border-b border-[#E6D496]">
                VERIFIED INDIAN SKU SPECIFICATIONS
              </div>
              <dl className="divide-y divide-[#F5ECCB]">
                {product.specs.map((row) => (
                  <div
                    key={row.label}
                    className="px-5 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm"
                  >
                    <dt className="font-mono text-xs uppercase tracking-wider text-[#5C5240]">
                      {row.label}
                    </dt>
                    <dd className="sm:col-span-2 font-semibold text-[#241E14]">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl border border-[#E6D496] p-5 bg-[#FFF8DF]">
                <div className="mono-eyebrow text-[#855400] mb-3">IN THE BOX</div>
                <ul className="space-y-2 text-sm text-[#5C5240]">
                  {product.inTheBox.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-[2px] bg-[#EAB308] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-[#E6D496] p-5 bg-white">
                <div className="mono-eyebrow text-[#9A6700] mb-2">
                  ■ INDIA WARRANTY &amp; GST NOTE
                </div>
                <p className="text-xs text-[#5C5240] leading-relaxed">{product.warrantyNote}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compact Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#FFFDF7]/95 backdrop-blur-md border-t border-[#E6D496]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div>
              <span className="hidden sm:block font-mono text-[9px] uppercase tracking-wider text-[#855400]">
                LOWEST FINAL PRICE ({bestOffer.listing.storeName})
              </span>
              <AnimatedINR
                value={bestOffer.finalPayablePrice}
                className="font-mono text-lg sm:text-xl font-bold text-[#241E14]"
              />
            </div>

            <button
              type="button"
              onClick={scrollToLeaderboard}
              className="hidden md:inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-[#9A6700] hover:underline underline-offset-4 cursor-pointer"
            >
              <span>COMPARE {product.storesChecked} STORES ↓</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedCompareStoreIds.length >= 2 && (
              <button
                type="button"
                onClick={() => setIsCompareDrawerOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 h-9 rounded-xl border border-[#D9C37B] bg-white text-[#241E14] font-mono text-[10px] font-semibold uppercase tracking-wider hover:bg-[#FEF0B8] cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>COMPARE ({selectedCompareStoreIds.length})</span>
              </button>
            )}

            <a
              href={bestOffer.listing.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-4 sm:px-5 rounded-xl bg-[#F5B800] hover:bg-[#E5A900] text-[#241E14] font-mono text-[11px] font-bold uppercase tracking-[0.08em] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>BUY FROM {bestOffer.listing.storeName}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Compare Drawer */}
      <CompareStoresDrawer
        isOpen={isCompareDrawerOpen}
        onClose={() => setIsCompareDrawerOpen(false)}
        productName={product.name}
        selectedOffers={compareSelectedOffers}
        onRemoveStore={(id) => toggleStoreForCompare(id)}
      />

      {/* Report Incorrect Price Modal */}
      {reportingStoreName && (
        <div
          className="fixed inset-0 z-50 bg-[#241E14]/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Report incorrect price or fee"
        >
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E6D496] overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 bg-[#FEF0B8] text-[#241E14] border-b border-[#E6D496] flex items-center justify-between">
              <span className="mono-eyebrow text-[#855400]">REPORT PRICE OR FEE DISCREPANCY</span>
              <button
                type="button"
                onClick={() => setReportingStoreName(null)}
                className="text-[#5C5240] hover:text-[#241E14] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitReport} className="p-5 space-y-4">
              <p className="text-xs text-[#5C5240]">
                Flagging <strong className="text-[#241E14]">{reportingStoreName}</strong> for{' '}
                <strong className="text-[#241E14]">{product.shortName}</strong> (Pincode{' '}
                {prefs.pincode}).
              </p>
              <textarea
                rows={3}
                required
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder="e.g. Packaging fee changed to ₹249, or HDFC card discount expired..."
                className="w-full p-3 rounded-xl border border-[#D9C37B] text-sm outline-none focus:border-[#EAB308]"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#F5B800] hover:bg-[#E5A900] text-[#241E14] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                {reportSubmitted ? '■ REPORT LOGGED FOR RE-CHECK' : 'SUBMIT AUDIT REPORT →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
