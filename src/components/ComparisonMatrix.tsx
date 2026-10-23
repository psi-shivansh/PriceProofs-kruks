import React from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Offer } from '../types/product.ts';
import { formatINR } from '../core/formatters.ts';

interface ComparisonMatrixProps {
  selectedOffers: Offer[];
  onClose: () => void;
  onRemoveOffer: (offerId: string) => void;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  selectedOffers,
  onClose,
  onRemoveOffer,
}) => {
  if (selectedOffers.length === 0) return null;

  // Find lowest total among selected offers
  const lowestTotal = Math.min(
    ...selectedOffers.map((o) => o.totalCostCalculation.knownTotal)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                Direct Matrix
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Side-by-Side True Cost Comparison ({selectedOffers.length} offers)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare actual out-of-pocket totals, return shipping traps, and warranty protections.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Matrix Table */}
        <div className="p-4 sm:p-6 overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-[650px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-3 px-4 font-semibold text-slate-400 w-44">Metric</th>
                {selectedOffers.map((offer) => {
                  const isWinner =
                    offer.totalCostCalculation.knownTotal === lowestTotal;
                  return (
                    <th key={offer.id} className="py-3 px-4 min-w-[200px] align-top">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-white text-sm line-clamp-2">
                          {offer.seller.name}
                        </div>
                        <button
                          onClick={() => onRemoveOffer(offer.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {isWinner && (
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>LOWEST TOTAL</span>
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {/* Product Info */}
              <tr>
                <td className="py-3.5 px-4 font-medium text-slate-400">Product Title</td>
                {selectedOffers.map((offer) => (
                  <td key={offer.id} className="py-3.5 px-4 text-slate-300">
                    <div className="line-clamp-2 font-medium">{offer.title}</div>
                  </td>
                ))}
              </tr>

              {/* Advertised Sticker Price */}
              <tr className="bg-slate-950/40">
                <td className="py-3.5 px-4 font-medium text-slate-400">Advertised Sticker Price</td>
                {selectedOffers.map((offer) => (
                  <td key={offer.id} className="py-3.5 px-4 font-mono text-slate-300 font-semibold">
                    {formatINR(offer.basePrice)}
                  </td>
                ))}
              </tr>

              {/* Delivery Fee */}
              <tr>
                <td className="py-3.5 px-4 font-medium text-slate-400">Delivery Fee</td>
                {selectedOffers.map((offer) => (
                  <td key={offer.id} className="py-3.5 px-4">
                    {offer.delivery.isUnknown ? (
                      <span className="text-amber-400 font-medium">Undisclosed until checkout</span>
                    ) : offer.delivery.isFree ? (
                      <span className="text-emerald-400 font-semibold">FREE (₹0)</span>
                    ) : (
                      <span className="text-slate-300 font-mono">+{formatINR(offer.delivery.fee)}</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Mandatory Handling Fees */}
              <tr className="bg-slate-950/40">
                <td className="py-3.5 px-4 font-medium text-slate-400">Mandatory Surcharges</td>
                {selectedOffers.map((offer) => {
                  const feeTotal = offer.mandatoryFees.reduce((s, f) => s + f.amount, 0);
                  return (
                    <td key={offer.id} className="py-3.5 px-4">
                      {feeTotal === 0 ? (
                        <span className="text-slate-400">₹0</span>
                      ) : (
                        <span className="text-amber-300 font-mono font-medium">
                          +{formatINR(feeTotal)} ({offer.mandatoryFees.map((f) => f.name).join(', ')})
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* REAL TOTAL KNOWN COST */}
              <tr className="bg-emerald-950/20 border-y-2 border-emerald-500/40">
                <td className="py-4 px-4 font-bold text-white text-sm">
                  TOTAL KNOWN COST
                </td>
                {selectedOffers.map((offer) => {
                  const isWinner =
                    offer.totalCostCalculation.knownTotal === lowestTotal;
                  return (
                    <td key={offer.id} className="py-4 px-4">
                      <div className="flex items-baseline gap-1 font-mono">
                        <span
                          className={`text-xl font-extrabold ${
                            isWinner ? 'text-emerald-400' : 'text-slate-200'
                          }`}
                        >
                          {formatINR(offer.totalCostCalculation.knownTotal)}
                        </span>
                        {offer.totalCostCalculation.completeness !== 'COMPLETE' && (
                          <span className="text-amber-400 text-xs">*est</span>
                        )}
                      </div>
                      {offer.totalCostCalculation.stickerDelta > 0 && (
                        <div className="text-[10px] text-amber-400/90 mt-0.5">
                          +{formatINR(offer.totalCostCalculation.stickerDelta)} added at checkout
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Return Window */}
              <tr>
                <td className="py-3.5 px-4 font-medium text-slate-400">Return Window</td>
                {selectedOffers.map((offer) => (
                  <td key={offer.id} className="py-3.5 px-4 text-slate-300">
                    {offer.returnPolicy.windowDays} Days
                  </td>
                ))}
              </tr>

              {/* Return Shipping Fee */}
              <tr className="bg-slate-950/40">
                <td className="py-3.5 px-4 font-medium text-slate-400">Return Shipping Charge</td>
                {selectedOffers.map((offer) => (
                  <td key={offer.id} className="py-3.5 px-4">
                    {offer.returnPolicy.isFreeReturn ? (
                      <span className="text-emerald-400 font-semibold">Free Prepaid Label</span>
                    ) : (
                      <span className="text-rose-400 font-medium">
                        Customer pays {formatINR(offer.returnPolicy.shippingCharge)}
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Restocking Fee */}
              <tr>
                <td className="py-3.5 px-4 font-medium text-slate-400">Restocking Fee</td>
                {selectedOffers.map((offer) => (
                  <td key={offer.id} className="py-3.5 px-4">
                    {offer.returnPolicy.restockingFeePercentage ? (
                      <span className="text-rose-400 font-semibold">
                        {offer.returnPolicy.restockingFeePercentage}% of item price
                      </span>
                    ) : (
                      <span className="text-slate-400">None (₹0)</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Warranty Coverage */}
              <tr className="bg-slate-950/40">
                <td className="py-3.5 px-4 font-medium text-slate-400">Warranty</td>
                {selectedOffers.map((offer) => (
                  <td key={offer.id} className="py-3.5 px-4 text-slate-300">
                    <div className="font-semibold">{offer.warranty.durationMonths} Months</div>
                    <div className="text-[11px] text-slate-400">{offer.warranty.coverage}</div>
                  </td>
                ))}
              </tr>

              {/* Data Source & Authenticity */}
              <tr>
                <td className="py-3.5 px-4 font-medium text-slate-400">Data Origin</td>
                {selectedOffers.map((offer) => (
                  <td key={offer.id} className="py-3.5 px-4 text-slate-400 text-[11px]">
                    <div className="font-medium text-slate-300">{offer.dataSource.providerName}</div>
                    <div>{offer.dataSource.isLive ? '✓ Authenticated Live Feed' : 'Demo Dataset Simulation'}</div>
                  </td>
                ))}
              </tr>

              {/* Action Buttons */}
              <tr className="bg-slate-950">
                <td className="py-4 px-4 font-medium text-slate-400">Seller Link</td>
                {selectedOffers.map((offer) => (
                  <td key={offer.id} className="py-4 px-4">
                    <a
                      href={offer.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <span>Go to Seller</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Tip: PriceProof calculates all totals from official data feeds without scraping.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
