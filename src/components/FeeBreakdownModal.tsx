import React from 'react';
import {
  X,
  Receipt,
  Truck,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  CreditCard,
  Building,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Offer } from '../types/product.ts';
import { formatINR } from '../core/formatters.ts';

interface FeeBreakdownModalProps {
  offer: Offer | null;
  onClose: () => void;
}

export const FeeBreakdownModal: React.FC<FeeBreakdownModalProps> = ({ offer, onClose }) => {
  if (!offer) return null;

  const calc = offer.totalCostCalculation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                Audit Trail
              </span>
              <span className="text-xs text-slate-400">Sold by {offer.seller.name}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1 line-clamp-1">
              {offer.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-sm">
          {/* Warning Banner if Incomplete or Deceptive */}
          {calc.isDeceptiveSticker && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-300 text-xs">Sticker Price Trap Alert</h4>
                <p className="text-xs text-amber-200/90 mt-0.5">
                  The initial sticker price appeared lowest, but mandatory shipping and platform fees make
                  the total out-of-pocket cost higher than competitors with free shipping.
                </p>
              </div>
            </div>
          )}

          {calc.completeness !== 'COMPLETE' && (
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-300 text-xs">Partial Cost Estimate</h4>
                <p className="text-xs text-blue-200/90 mt-0.5">
                  This seller does not disclose freight/shipping charges until checkout zip code is provided.
                  PriceProof lists the floor cost; final charges may vary by postal area.
                </p>
              </div>
            </div>
          )}

          {/* 1. Itemized Financial Receipt */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Transparent Price & Fee Receipt</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Advertised Base Price (Sticker)</span>
                <span className="font-mono font-medium">{formatINR(offer.basePrice)}</span>
              </div>

              {/* Delivery */}
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Delivery & Freight</span>
                  {offer.delivery.freeThreshold && (
                    <span className="text-[10px] text-slate-400">(Free threshold {formatINR(offer.delivery.freeThreshold)})</span>
                  )}
                </span>
                <span className="font-mono">
                  {offer.delivery.isUnknown
                    ? 'Undisclosed until zip code'
                    : offer.delivery.isFree
                    ? 'FREE (₹0)'
                    : `+${formatINR(offer.delivery.fee)}`}
                </span>
              </div>

              {/* Mandatory Fees */}
              {offer.mandatoryFees.map((fee, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span>+ {fee.name}</span>
                    {fee.description && (
                      <span className="text-[10px] text-slate-500">({fee.description})</span>
                    )}
                  </span>
                  <span className="font-mono text-amber-300">
                    {fee.isUnknown ? 'Unknown' : `+${formatINR(fee.amount)}`}
                  </span>
                </div>
              ))}

              {/* Unconditional Discounts */}
              {offer.discounts
                .filter((d) => !d.isConditional && d.applied)
                .map((disc, idx) => (
                  <div key={idx} className="flex justify-between items-center text-emerald-400">
                    <span>- {disc.name}</span>
                    <span className="font-mono">-{formatINR(disc.amount)}</span>
                  </div>
                ))}

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="font-bold text-white text-sm">Total Known Cost</span>
                <span className="font-mono font-extrabold text-xl text-emerald-400">
                  {formatINR(calc.knownTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Conditional Discounts & Membership Trap */}
          {offer.discounts.some((d) => d.isConditional) && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4" />
                <span>Conditional Discount Disclaimers</span>
              </h4>
              <p className="text-xs text-slate-400 mb-2">
                These advertised discounts require specific cards or qualifying conditions and are excluded
                from the baseline fair comparison:
              </p>
              <div className="space-y-1.5">
                {offer.discounts
                  .filter((d) => d.isConditional)
                  .map((d, idx) => (
                    <div key={idx} className="text-xs p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-300 font-medium">{d.name}</span>
                      <span className="text-amber-400 font-mono">-{formatINR(d.amount)} conditional</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 3. Return & Refund Conditions */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
              <RotateCcw className="w-4 h-4 text-teal-400" />
              <span>Return Policy & Refund Conditions</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Return Window</div>
                <div className="font-bold text-white mt-0.5">{offer.returnPolicy.windowDays} Days</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Return Shipping Fee</div>
                <div className="font-bold text-white mt-0.5">
                  {offer.returnPolicy.isFreeReturn
                    ? 'Free (₹0)'
                    : offer.returnPolicy.shippingCharge === -1
                    ? 'Buyer Arranged'
                    : formatINR(offer.returnPolicy.shippingCharge)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Restocking Fee</div>
                <div className="font-bold text-white mt-0.5">
                  {offer.returnPolicy.restockingFeePercentage
                    ? `${offer.returnPolicy.restockingFeePercentage}%`
                    : 'None (₹0)'}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400">{offer.returnPolicy.details}</p>
          </div>

          {/* 4. Warranty & Manufacturer Guarantee */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Warranty Coverage & Support</span>
            </h4>
            <div className="flex items-center gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                <div className="text-slate-400">Duration</div>
                <div className="font-bold text-white mt-0.5">
                  {offer.warranty.durationMonths > 0
                    ? `${offer.warranty.durationMonths} Months`
                    : 'No Warranty'}
                </div>
              </div>
              <div className="text-xs text-slate-300">
                <div className="font-medium">{offer.warranty.coverage}</div>
                {offer.warranty.claimsProcess && (
                  <div className="text-slate-400 mt-1">{offer.warranty.claimsProcess}</div>
                )}
              </div>
            </div>
          </div>

          {/* 5. Data Source & Timestamp */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-300">Data Source:</span>{' '}
              {offer.dataSource.providerName} ({offer.dataSource.isLive ? 'Live API Feed' : 'Demo Dataset'})
            </div>
            <div>
              Retrieved: {new Date(offer.dataSource.retrievedAt).toLocaleDateString()} {new Date(offer.dataSource.retrievedAt).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
          >
            Close
          </button>
          <a
            href={offer.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <span>Proceed to Seller Product Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
