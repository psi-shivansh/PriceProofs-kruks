import React from 'react';
import {
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Info,
  Truck,
  RotateCcw,
  Receipt,
  Layers,
  Sparkles,
  TrendingDown,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Offer, TransparencyGrade } from '../types/product.ts';
import { formatINR } from '../core/formatters.ts';

interface OfferCardProps {
  offer: Offer;
  onInspect: (offer: Offer) => void;
  isSelectedForCompare: boolean;
  onToggleCompare: (offerId: string) => void;
  isLowestTotalInGroup: boolean;
}

const GRADE_COLORS: Record<TransparencyGrade, { bg: string; text: string; border: string }> = {
  A: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  B: { bg: 'bg-teal-500/15', text: 'text-teal-300', border: 'border-teal-500/30' },
  C: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  D: { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30' },
  F: { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
};

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onInspect,
  isSelectedForCompare,
  onToggleCompare,
  isLowestTotalInGroup,
}) => {
  const calc = offer.totalCostCalculation;
  const gradeStyle = GRADE_COLORS[calc.transparencyGrade] || GRADE_COLORS.C;

  const hasMandatoryFees = offer.mandatoryFees.length > 0;
  const mandatoryTotal = offer.mandatoryFees.reduce((sum, f) => sum + (f.amount || 0), 0);

  return (
    <div
      className={`relative rounded-2xl transition-all duration-200 border ${
        isLowestTotalInGroup
          ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Banner: Winner badge or Deceptive sticker alert */}
      {isLowestTotalInGroup && (
        <div className="bg-emerald-500 text-slate-950 px-4 py-1.5 rounded-t-2xl font-bold text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>TRUE LOWEST TOTAL COST WINNER</span>
          </div>
          <span className="text-[11px] font-semibold opacity-90">Cheapest overall out-of-pocket</span>
        </div>
      )}

      {calc.isDeceptiveSticker && !isLowestTotalInGroup && (
        <div className="bg-amber-500/20 text-amber-300 border-b border-amber-500/30 px-4 py-1.5 rounded-t-2xl font-semibold text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>STICKER PRICE TRAP DETECTED</span>
          </div>
          <span className="text-[10px] text-amber-300/80">Cheaper sticker, but fees make it more expensive</span>
        </div>
      )}

      <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-5">
        {/* Left: Product Thumbnail & Checkbox */}
        <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 sm:w-36 shrink-0">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center p-2">
            <img
              src={offer.imageUrl}
              alt={offer.title}
              className="w-full h-full object-contain hover:scale-105 transition-transform"
              loading="lazy"
              onError={(e) => {
                // Fallback placeholder image if remote fails
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=60';
              }}
            />
            {offer.dataSource.isLive ? (
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-slate-950 uppercase">
                LIVE API
              </span>
            ) : (
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 uppercase">
                DEMO DATA
              </span>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isSelectedForCompare}
              onChange={() => onToggleCompare(offer.id)}
              className="w-4 h-4 rounded text-emerald-500 border-slate-700 bg-slate-950 focus:ring-0"
            />
            <span>Compare</span>
          </label>
        </div>

        {/* Center: Title, Seller, Policies, Warnings */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                  <span>Sold by: <span className="text-slate-200">{offer.seller.name}</span></span>
                  {offer.seller.sellerRating && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px] font-medium">
                      ★ {offer.seller.sellerRating} ({offer.seller.totalReviews} reviews)
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mt-1 leading-snug">
                  {offer.title}
                </h3>
              </div>

              {/* Transparency Badge */}
              <div
                className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold ${gradeStyle.bg} ${gradeStyle.text} ${gradeStyle.border}`}
                title={`Fee Transparency Score: Grade ${calc.transparencyGrade}`}
              >
                <span>Score: {calc.transparencyGrade}</span>
              </div>
            </div>

            {/* Quick Policy Attributes Pills */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {/* Delivery Pill */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                  offer.delivery.isUnknown
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : offer.delivery.isFree
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>
                  {offer.delivery.isUnknown
                    ? 'Delivery: Undisclosed (+?)'
                    : offer.delivery.isFree
                    ? 'Free Delivery'
                    : `+${formatINR(offer.delivery.fee)} Delivery`}
                </span>
              </div>

              {/* Return Policy Pill */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                  offer.returnPolicy.isFreeReturn
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>
                  {offer.returnPolicy.isFreeReturn
                    ? `${offer.returnPolicy.windowDays}d Free Returns`
                    : `Return Fee: ${formatINR(offer.returnPolicy.shippingCharge)}`}
                </span>
              </div>

              {/* Warranty Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>
                  {offer.warranty.durationMonths > 0
                    ? `${offer.warranty.durationMonths}M Warranty`
                    : 'No Warranty'}
                </span>
              </div>

              {/* Mandatory Fees Pill */}
              {hasMandatoryFees && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>+{formatINR(mandatoryTotal)} Mandatory Fees</span>
                </div>
              )}
            </div>

            {/* Warnings list if any */}
            {calc.warnings.length > 0 && (
              <div className="mt-3 space-y-1">
                {calc.warnings.slice(0, 2).map((warning, idx) => (
                  <p key={idx} className="text-xs text-amber-400/90 flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold shrink-0">!</span>
                    <span>{warning}</span>
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Source:</span>
              <span className="text-slate-300 font-medium">{offer.dataSource.providerName}</span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" />
                {new Date(offer.dataSource.retrievedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <button
              onClick={() => onInspect(offer)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Inspect All Fees & Terms</span>
            </button>
          </div>
        </div>

        {/* Right: True Cost Display & Action CTA */}
        <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-5 min-w-[170px]">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Total Known Cost
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {formatINR(calc.knownTotal)}
              </span>
              {calc.completeness !== 'COMPLETE' && (
                <span className="text-xs font-semibold text-amber-400" title="Partial estimate - delivery unknown">
                  *est
                </span>
              )}
            </div>

            {/* Sticker vs True Cost Delta */}
            <div className="text-xs text-slate-400 mt-1">
              <span>Sticker: </span>
              <span className={calc.stickerDelta > 0 ? 'line-through text-slate-400' : 'text-slate-300'}>
                {formatINR(offer.basePrice)}
              </span>
              {calc.stickerDelta > 0 && (
                <span className="ml-1 text-amber-400 font-medium">
                  (+{formatINR(calc.stickerDelta)} fees)
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 w-full">
            <a
              href={offer.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
            >
              <span>Visit Seller</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <button
              onClick={() => onInspect(offer)}
              className="inline-flex items-center justify-center gap-1 w-full px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium text-xs transition-colors cursor-pointer"
            >
              Fee Breakdown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
