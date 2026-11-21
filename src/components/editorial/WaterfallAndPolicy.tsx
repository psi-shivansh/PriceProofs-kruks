import React, { useState, useEffect, useRef } from 'react';
import {
  ExternalLink,
  Info,
  Bell,
  Check,
  HelpCircle,
  Clock,
} from 'lucide-react';
import {
  ComputedStoreOffer,
  PolicySignal,
  PriceHistoryPoint,
} from '../../data/indianCatalog.ts';
import { formatINR } from '../../core/formatters.ts';
import { AnimatedINR, EditorialBadge, StoreMonogram } from './Primitives.tsx';

/* ============================================================================
   1. TAB 02: PRICE WATERFALL CHART PER STORE (Cozy Yellow & White)
   ============================================================================ */

export const PriceWaterfallSection: React.FC<{
  offers: ComputedStoreOffer[];
}> = ({ offers }) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    offers[0]?.listing.storeId || ''
  );
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [barsVisible, setBarsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!offers.some((o) => o.listing.storeId === selectedStoreId) && offers[0]) {
      setSelectedStoreId(offers[0].listing.storeId);
    }
  }, [offers, selectedStoreId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setBarsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const activeOffer =
    offers.find((o) => o.listing.storeId === selectedStoreId) || offers[0];

  if (!activeOffer) return null;

  interface WaterfallRow {
    id: string;
    label: string;
    delta: number;
    runningTotal: number;
    kind: 'base' | 'discount' | 'fee' | 'final';
    isHidden?: boolean;
    explanation?: string;
    sourceLabel?: string;
    sourceUrl?: string;
  }

  const rows: WaterfallRow[] = [];
  let running = activeOffer.listedPrice;
  rows.push({
    id: 'listed',
    label: 'Listed Store Price',
    delta: activeOffer.listedPrice,
    runningTotal: running,
    kind: 'base',
    explanation: 'Advertised price shown on the store product page before checkout.',
  });

  if (activeOffer.couponSavings > 0) {
    running -= activeOffer.couponSavings;
    rows.push({
      id: 'coupon',
      label: `Coupon (${activeOffer.appliedCoupons.map((c) => c.code).join(', ')})`,
      delta: -activeOffer.couponSavings,
      runningTotal: running,
      kind: 'discount',
      explanation: activeOffer.appliedCoupons.map((c) => c.label).join(' · '),
    });
  }

  if (activeOffer.bankSavings > 0 && activeOffer.appliedBankOffer) {
    running -= activeOffer.bankSavings;
    rows.push({
      id: 'bank',
      label: activeOffer.appliedBankOffer.label,
      delta: -activeOffer.bankSavings,
      runningTotal: running,
      kind: 'discount',
      explanation: 'Instant discount applied for your selected bank card in the bar above.',
    });
  }

  for (const fee of activeOffer.activeFeeLines) {
    running += fee.effectiveAmount;
    rows.push({
      id: fee.id,
      label: fee.label,
      delta: fee.effectiveAmount,
      runningTotal: running,
      kind: 'fee',
      isHidden: fee.isHidden && fee.effectiveAmount > 0,
      explanation: fee.explanation,
      sourceLabel: fee.sourceLabel,
      sourceUrl: fee.sourceUrl,
    });
  }

  rows.push({
    id: 'final',
    label: 'True Final Payable Price',
    delta: activeOffer.finalPayablePrice,
    runningTotal: activeOffer.finalPayablePrice,
    kind: 'final',
    explanation: 'Exact rupee amount charged on the final payment step.',
  });

  const maxScale = Math.max(
    activeOffer.listedPrice,
    activeOffer.finalPayablePrice,
    ...rows.map((r) => r.runningTotal),
    1
  );

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Store switcher strip */}
      <div className="flex flex-wrap items-center gap-2">
        {offers.map((offer) => {
          const isSelected = offer.listing.storeId === activeOffer.listing.storeId;
          return (
            <button
              key={offer.listing.storeId}
              type="button"
              onClick={() => setSelectedStoreId(offer.listing.storeId)}
              className={`px-3.5 py-2 rounded-xl border font-mono text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-[#241E14] text-[#FFFDF7] border-[#241E14]'
                  : 'bg-white text-[#241E14] border-[#EFE3B8] hover:border-[#F5B800] hover:bg-[#FFF8DF]'
              }`}
            >
              <span>{offer.listing.storeName}</span>
              <span className={isSelected ? 'text-[#FDE047]' : 'text-[#855400]'}>
                {formatINR(offer.finalPayablePrice)}
              </span>
              {offer.hiddenFeesCount > 0 && (
                <span className="text-[#D97706] font-bold">⚠ {offer.hiddenFeesCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Waterfall Panel */}
      <div className="rounded-2xl border border-[#E6D496] bg-white overflow-hidden">
        <div className="px-5 py-4 bg-[#FFF8DF] border-b border-[#EFE3B8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <StoreMonogram
              shortCode={activeOffer.listing.shortCode}
              bg={activeOffer.listing.storeAccentBg}
              text={activeOffer.listing.storeAccentText}
            />
            <div>
              <h3 className="text-base font-bold text-[#241E14]">
                {activeOffer.listing.storeName} — Checkout Price Waterfall
              </h3>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#855400]">
                VERIFIED {activeOffer.listing.verifiedAgo} ({activeOffer.listing.verifiedTimestamp})
              </p>
            </div>
          </div>

          <div>
            {activeOffer.hiddenFeesCount > 0 ? (
              <EditorialBadge variant="amber">
                ⚠ {activeOffer.hiddenFeesCount} HIDDEN FEE{activeOffer.hiddenFeesCount > 1 ? 'S' : ''} (+
                {formatINR(activeOffer.hiddenFeesTotal)})
              </EditorialBadge>
            ) : (
              <EditorialBadge variant="green-outline" withGreenSquare>
                ₹0 HIDDEN CHARGES
              </EditorialBadge>
            )}
          </div>
        </div>

        <div className="divide-y divide-[#F5ECCB]">
          {rows.map((row, idx) => {
            const barWidthPct =
              row.kind === 'base' || row.kind === 'final'
                ? Math.max(12, Math.round((row.runningTotal / maxScale) * 100))
                : Math.max(
                    3,
                    Math.min(100, Math.round((Math.abs(row.delta) / maxScale) * 100) * 6)
                  );

            const barColor =
              row.kind === 'base'
                ? 'bg-[#857861]'
                : row.kind === 'discount'
                ? 'bg-[#15803D]'
                : row.kind === 'final'
                ? 'bg-[#F5B800]'
                : row.isHidden
                ? 'bg-[#D97706]'
                : 'bg-[#C4B07A]';

            const isTooltipOpen = activeTooltipId === row.id;

            return (
              <div
                key={row.id}
                className={`px-5 py-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center ${
                  row.kind === 'final' ? 'bg-[#FFFDF0]' : 'bg-white'
                }`}
              >
                <div className="md:col-span-5 flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[13px] ${
                      row.kind === 'final' || row.kind === 'base'
                        ? 'font-bold text-[#241E14]'
                        : 'font-medium text-[#241E14]'
                    }`}
                  >
                    {row.label}
                  </span>

                  {row.isHidden && <EditorialBadge variant="amber">⚠ HIDDEN</EditorialBadge>}

                  {row.explanation && (
                    <button
                      type="button"
                      onClick={() => setActiveTooltipId(isTooltipOpen ? null : row.id)}
                      onMouseEnter={() => setActiveTooltipId(row.id)}
                      onMouseLeave={() => setActiveTooltipId(null)}
                      aria-label={`Explain ${row.label}`}
                      className="text-[#857861] hover:text-[#241E14] p-0.5 cursor-pointer relative"
                    >
                      <Info className="w-3.5 h-3.5" />
                      {isTooltipOpen && (
                        <div className="absolute left-0 bottom-full mb-2 w-72 p-3 rounded-xl bg-[#241E14] text-[#FFFDF7] text-left text-xs leading-relaxed z-30 shadow-lg">
                          <p className="font-normal">{row.explanation}</p>
                          {row.sourceLabel && (
                            <span className="block mt-1.5 font-mono text-[10px] uppercase text-[#FDE047]">
                              SOURCE: {row.sourceLabel}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  )}

                  {row.sourceUrl && row.sourceLabel && (
                    <a
                      href={row.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 font-mono text-[10px] uppercase text-[#855400] hover:text-[#241E14] underline underline-offset-2"
                    >
                      <span>Source</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                <div className="md:col-span-5">
                  <div className="h-5 rounded-md bg-[#FFF8DF] border border-[#EFE3B8] relative overflow-hidden">
                    <div
                      className={`h-full ${barColor} transition-transform duration-500 origin-left`}
                      style={{
                        width: `${barWidthPct}%`,
                        transform: barsVisible ? 'scaleX(1)' : 'scaleX(0)',
                        transitionDelay: `${idx * 55}ms`,
                      }}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 text-right font-mono tabular-price">
                  {row.kind === 'base' || row.kind === 'final' ? (
                    <AnimatedINR
                      value={row.delta}
                      className={
                        row.kind === 'final'
                          ? 'text-[16px] font-bold text-[#241E14]'
                          : 'text-[14px] font-semibold text-[#5C5240]'
                      }
                    />
                  ) : row.delta < 0 ? (
                    <span className="text-[13px] font-bold text-[#15803D]">
                      −{formatINR(Math.abs(row.delta))}
                    </span>
                  ) : row.delta === 0 ? (
                    <span className="text-[12px] text-[#15803D] font-semibold">FREE (₹0)</span>
                  ) : (
                    <span
                      className={`text-[13px] font-bold ${
                        row.isHidden ? 'text-[#B45309]' : 'text-[#241E14]'
                      }`}
                    >
                      +{formatINR(row.delta)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All-store Fee Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {offers.slice(0, 4).map((o) => (
          <button
            key={o.listing.storeId}
            type="button"
            onClick={() => setSelectedStoreId(o.listing.storeId)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              o.listing.storeId === activeOffer.listing.storeId
                ? 'border-[#F5B800] bg-[#FFF8DF]'
                : 'border-[#EFE3B8] bg-white hover:border-[#F5B800]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#241E14]">{o.listing.storeName}</span>
              <span className="font-mono text-[10px] uppercase text-[#857861]">
                FEES +{formatINR(o.totalFees)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[15px] font-bold text-[#241E14] tabular-price">
                {formatINR(o.finalPayablePrice)}
              </span>
              <span
                className={`font-mono text-[10px] font-semibold ${
                  o.hiddenFeesCount > 0 ? 'text-[#B45309]' : 'text-[#15803D]'
                }`}
              >
                {o.hiddenFeesCount > 0 ? `⚠ ${o.hiddenFeesCount} HIDDEN` : '■ TRANSPARENT'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
   2. TAB 03: RETURNS & REFUNDS COMPARISON MATRIX + VISUAL TIMELINE
   ============================================================================ */

const PolicyCell: React.FC<{
  text: string;
  signal: PolicySignal;
}> = ({ text, signal }) => {
  const styles: Record<PolicySignal, { wrap: string; tag: string }> = {
    good: { wrap: 'bg-[#ECFDF3] text-[#14532D]', tag: '■ GOOD' },
    warn: { wrap: 'bg-[#FEF3C7] text-[#92400E]', tag: '▲ RESTRICTED' },
    bad: { wrap: 'bg-[#FEE2E2] text-[#991B1B]', tag: '✕ STRICT' },
    not_found: { wrap: 'bg-[#FAF8F2] text-[#5C5240]', tag: '? UNVERIFIED' },
  };
  return (
    <div className={`px-2.5 py-2 rounded-lg ${styles[signal].wrap}`}>
      <span className="block font-mono text-[9px] font-bold uppercase tracking-wider opacity-80 mb-0.5">
        {styles[signal].tag}
      </span>
      <span className="text-xs font-semibold leading-snug block">{text}</span>
    </div>
  );
};

export const ReturnPolicyMatrixSection: React.FC<{
  offers: ComputedStoreOffer[];
}> = ({ offers }) => {
  const [timelineStoreId, setTimelineStoreId] = useState<string>(
    offers.find((o) => o.listing.returnPolicy.policyFound)?.listing.storeId ||
      offers[0]?.listing.storeId ||
      ''
  );

  const timelineOffer =
    offers.find((o) => o.listing.storeId === timelineStoreId) || offers[0];

  return (
    <div className="space-y-8">
      {/* Desktop Matrix Table */}
      <div className="hidden lg:block rounded-2xl border border-[#E6D496] overflow-x-auto bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FEF0B8] text-[#241E14] font-mono text-[10px] uppercase tracking-[0.09em] border-b border-[#E6D496]">
              <th className="py-3.5 px-4 font-semibold">Store</th>
              <th className="py-3.5 px-3 font-semibold">Return Window</th>
              <th className="py-3.5 px-3 font-semibold">Return Shipping</th>
              <th className="py-3.5 px-3 font-semibold">Refund Method</th>
              <th className="py-3.5 px-3 font-semibold">Refund Speed</th>
              <th className="py-3.5 px-3 font-semibold">Restocking Fee</th>
              <th className="py-3.5 px-3 font-semibold">Exchange</th>
              <th className="py-3.5 px-4 font-semibold">Conditions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFE3B8]">
            {offers.map((offer) => {
              const rp = offer.listing.returnPolicy;
              return (
                <React.Fragment key={offer.listing.storeId}>
                  <tr className="align-top bg-white">
                    <td className="p-4 w-44">
                      <div className="flex items-center gap-2.5">
                        <StoreMonogram
                          shortCode={offer.listing.shortCode}
                          bg={offer.listing.storeAccentBg}
                          text={offer.listing.storeAccentText}
                          size="sm"
                        />
                        <div>
                          <div className="text-[13px] font-bold text-[#241E14]">
                            {offer.listing.storeName}
                          </div>
                          <div className="font-mono text-[10px] text-[#855400]">
                            POLICY {rp.policyScore}/100
                          </div>
                        </div>
                      </div>
                    </td>

                    {!rp.policyFound ? (
                      <td colSpan={7} className="p-4 bg-[#FFFDF4]">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2.5 text-[#5C5240]">
                            <HelpCircle className="w-4 h-4 text-[#B45309] shrink-0" />
                            <div>
                              <span className="font-mono text-[11px] font-bold uppercase text-[#92400E]">
                                POLICY NOT FOUND ON SELLER LISTING
                              </span>
                              <p className="text-xs text-[#5C5240] mt-0.5">{rp.conditions}</p>
                            </div>
                          </div>
                          <a
                            href={rp.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[10px] uppercase text-[#855400] underline whitespace-nowrap"
                          >
                            Check store policy ↗
                          </a>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="p-2.5">
                          <PolicyCell text={rp.windowLabel} signal={rp.windowSignal} />
                        </td>
                        <td className="p-2.5">
                          <PolicyCell
                            text={rp.returnShippingLabel}
                            signal={rp.returnShippingSignal}
                          />
                        </td>
                        <td className="p-2.5">
                          <PolicyCell text={rp.refundMethod} signal={rp.refundMethodSignal} />
                        </td>
                        <td className="p-2.5">
                          <PolicyCell text={rp.refundSpeed} signal={rp.refundSpeedSignal} />
                        </td>
                        <td className="p-2.5">
                          <PolicyCell
                            text={rp.restockingFeeLabel}
                            signal={rp.restockingSignal}
                          />
                        </td>
                        <td className="p-2.5">
                          <PolicyCell text={rp.exchangeAllowed} signal={rp.exchangeSignal} />
                        </td>
                        <td className="p-3 text-xs text-[#5C5240] leading-relaxed max-w-[210px]">
                          {rp.conditions}
                        </td>
                      </>
                    )}
                  </tr>
                  <tr className="bg-[#FFFDF4]">
                    <td colSpan={8} className="px-4 py-2 border-t border-[#F5ECCB]">
                      <div className="flex items-center justify-between gap-4 text-xs">
                        <span>
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#855400] mr-2">
                            PLAIN ENGLISH:
                          </span>
                          <span className="text-[#5C5240]">{rp.plainEnglishSummary}</span>
                        </span>
                        <a
                          href={rp.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] uppercase text-[#9A6700] hover:underline whitespace-nowrap shrink-0"
                        >
                          POLICY SOURCE ↗
                        </a>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Swipeable Policy Cards */}
      <div className="lg:hidden flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
        {offers.map((offer) => {
          const rp = offer.listing.returnPolicy;
          return (
            <div
              key={offer.listing.storeId}
              className="min-w-[300px] max-w-[320px] snap-start rounded-2xl border border-[#E6D496] bg-white p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between border-b border-[#F5ECCB] pb-2.5">
                <div className="flex items-center gap-2">
                  <StoreMonogram
                    shortCode={offer.listing.shortCode}
                    bg={offer.listing.storeAccentBg}
                    text={offer.listing.storeAccentText}
                    size="sm"
                  />
                  <span className="text-sm font-bold text-[#241E14]">
                    {offer.listing.storeName}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold text-[#9A6700]">
                  {rp.policyScore}/100
                </span>
              </div>

              {!rp.policyFound ? (
                <div className="p-3 rounded-xl bg-[#FFF8DF] text-xs text-[#5C5240]">
                  <p className="font-mono text-[10px] font-bold uppercase text-[#92400E] mb-1">
                    ⚠ POLICY NOT FOUND
                  </p>
                  {rp.conditions}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <PolicyCell text={rp.windowLabel} signal={rp.windowSignal} />
                  <PolicyCell text={rp.refundMethod} signal={rp.refundMethodSignal} />
                  <PolicyCell text={rp.returnShippingLabel} signal={rp.returnShippingSignal} />
                  <PolicyCell text={rp.refundSpeed} signal={rp.refundSpeedSignal} />
                </div>
              )}

              <p className="text-xs text-[#5C5240] leading-relaxed border-t border-[#F5ECCB] pt-2.5">
                {rp.plainEnglishSummary}
              </p>
            </div>
          );
        })}
      </div>

      {/* Cozy Sunbeam-Yellow Return Timeline */}
      <div className="rounded-2xl border border-[#E6D496] bg-[#FEF0B8] text-[#241E14] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E6D496]">
          <div>
            <div className="mono-eyebrow text-[#855400] flex items-center gap-1.5 mb-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>RETURN TIMELINE SIMULATOR</span>
            </div>
            <h3 className="text-xl font-bold text-[#241E14]">
              What happens after you return it
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {offers
              .filter((o) => o.listing.returnPolicy.policyFound)
              .map((o) => {
                const active = o.listing.storeId === timelineOffer?.listing.storeId;
                return (
                  <button
                    key={o.listing.storeId}
                    type="button"
                    onClick={() => setTimelineStoreId(o.listing.storeId)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#241E14] text-[#FDE047] border-[#241E14]'
                        : 'bg-white text-[#241E14] border-[#D9C37B] hover:border-[#241E14]'
                    }`}
                  >
                    {o.listing.storeName}
                  </button>
                );
              })}
          </div>
        </div>

        {timelineOffer && timelineOffer.listing.returnPolicy.timeline.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {timelineOffer.listing.returnPolicy.timeline.map((step, idx) => (
              <div
                key={step.step}
                className="p-4 rounded-xl bg-white border border-[#E6D496] flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-[#9A6700]">
                    STEP 0{idx + 1}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#855400] bg-[#FFF8DF] px-2 py-0.5 rounded border border-[#EFE3B8]">
                    {step.duration}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#241E14] mb-1">{step.step}</h4>
                  <p className="text-xs text-[#5C5240] leading-relaxed">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-xs text-[#5C5240]">
            No verified return timeline published for this seller.
          </p>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   3. PRICE HISTORY MINI-CHART WITH HOVER TOOLTIPS + SET PRICE ALERT
   ============================================================================ */

export const PriceHistoryMiniChart: React.FC<{
  productId: string;
  productName: string;
  history: PriceHistoryPoint[];
  currentBestPrice: number;
  existingAlertPrice?: number;
  onSetAlert: (productId: string, productName: string, targetPrice: number) => void;
}> = ({
  productId,
  productName,
  history,
  currentBestPrice,
  existingAlertPrice,
  onSetAlert,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [targetInput, setTargetInput] = useState(
    String(Math.round((currentBestPrice * 0.95) / 100) * 100)
  );
  const [alertSaved, setAlertSaved] = useState(false);

  if (history.length === 0) return null;

  const prices = history.flatMap((h) => [h.lowestTruePrice, h.avgListedPrice]);
  const minVal = Math.min(...prices) * 0.985;
  const maxVal = Math.max(...prices) * 1.015;
  const range = Math.max(1, maxVal - minVal);

  const width = 320;
  const height = 84;
  const padX = 10;
  const padY = 10;

  const points = history.map((pt, idx) => {
    const x =
      padX +
      (history.length === 1
        ? (width - padX * 2) / 2
        : (idx / (history.length - 1)) * (width - padX * 2));
    const yTrue = height - padY - ((pt.lowestTruePrice - minVal) / range) * (height - padY * 2);
    const yListed =
      height - padY - ((pt.avgListedPrice - minVal) / range) * (height - padY * 2);
    return { x, yTrue, yListed, pt };
  });

  const truePolyline = points.map((p) => `${p.x},${p.yTrue}`).join(' ');
  const listedPolyline = points.map((p) => `${p.x},${p.yListed}`).join(' ');
  const activePoint = hoverIdx !== null ? points[hoverIdx] : points[points.length - 1];

  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = parseInt(targetInput.replace(/\D/g, ''), 10);
    if (!numeric || numeric <= 0) return;
    onSetAlert(productId, productName, numeric);
    setAlertSaved(true);
    setTimeout(() => {
      setIsAlertOpen(false);
      setAlertSaved(false);
    }, 1100);
  };

  return (
    <div className="rounded-2xl border border-[#EFE3B8] bg-[#FFF8DF] p-4">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div>
          <div className="mono-eyebrow text-[#855400]">30-DAY TRUE PRICE HISTORY</div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="font-mono text-sm font-bold text-[#241E14] tabular-price">
              {formatINR(activePoint.pt.lowestTruePrice)}
            </span>
            <span className="font-mono text-[10px] uppercase text-[#5C5240]">
              {activePoint.pt.date} · {activePoint.pt.store}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAlertOpen((v) => !v)}
          className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
            existingAlertPrice
              ? 'bg-[#FEF0B8] border-[#EAB308] text-[#241E14]'
              : 'bg-white border-[#D9C37B] text-[#241E14] hover:bg-[#F5B800] hover:border-[#F5B800]'
          }`}
        >
          <Bell className="w-3 h-3" />
          <span>
            {existingAlertPrice
              ? `ALERT ≤ ${formatINR(existingAlertPrice)}`
              : 'SET PRICE ALERT'}
          </span>
        </button>
      </div>

      <div className="relative rounded-xl bg-white border border-[#EFE3B8] p-2.5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-[84px] overflow-visible"
          role="img"
          aria-label="30-day true price history chart"
        >
          <polyline
            fill="none"
            stroke="#D9C37B"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            points={listedPolyline}
          />
          <polyline
            fill="none"
            stroke="#D99B00"
            strokeWidth="2.4"
            points={truePolyline}
          />

          {points.map((p, idx) => {
            const isHovered = hoverIdx === idx || (hoverIdx === null && idx === points.length - 1);
            return (
              <g key={p.pt.date}>
                <circle
                  cx={p.x}
                  cy={p.yTrue}
                  r={isHovered ? 4.5 : 2.5}
                  fill={isHovered ? '#241E14' : '#EAB308'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
                <rect
                  x={p.x - 22}
                  y={0}
                  width={44}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIdx(idx)}
                  onMouseLeave={() => setHoverIdx(null)}
                />
              </g>
            );
          })}
        </svg>

        <div className="mt-1.5 flex items-center justify-between font-mono text-[9px] uppercase text-[#857861]">
          <span>{history[0].date}</span>
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#D99B00]" /> True lowest
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#D9C37B]" /> Avg listed
            </span>
          </span>
          <span>{history[history.length - 1].date}</span>
        </div>
      </div>

      {isAlertOpen && (
        <form
          onSubmit={handleSaveAlert}
          className="mt-3 pt-3 border-t border-[#EFE3B8] flex items-center gap-2"
        >
          <div className="flex-1 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-[#5C5240]">
              ₹
            </span>
            <input
              type="text"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              aria-label="Target price in INR"
              className="w-full h-9 pl-6 pr-2 rounded-lg bg-white border border-[#D9C37B] font-mono text-xs text-[#241E14] outline-none focus:border-[#EAB308]"
            />
          </div>
          <button
            type="submit"
            className="h-9 px-3.5 rounded-lg bg-[#241E14] text-[#FDE047] font-mono text-[10px] font-semibold uppercase tracking-wider hover:bg-[#3A3122] transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            {alertSaved ? (
              <>
                <Check className="w-3.5 h-3.5" /> SAVED
              </>
            ) : (
              <span>TRACK DROP</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
