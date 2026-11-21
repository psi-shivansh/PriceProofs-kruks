import React, { useState } from 'react';
import { X, ArrowUpRight, EyeOff, Eye } from 'lucide-react';
import { ComputedStoreOffer } from '../../data/indianCatalog.ts';
import { formatINR } from '../../core/formatters.ts';
import { EditorialBadge, StoreMonogram } from './Primitives.tsx';

interface CompareStoresDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  selectedOffers: ComputedStoreOffer[];
  onRemoveStore: (storeId: string) => void;
}

interface ComparisonRowDef {
  id: string;
  label: string;
  values: string[];
  emphasis?: 'final' | 'warn' | 'policy';
  bestIndex?: number;
}

export const CompareStoresDrawer: React.FC<CompareStoresDrawerProps> = ({
  isOpen,
  onClose,
  productName,
  selectedOffers,
  onRemoveStore,
}) => {
  const [hideIdentical, setHideIdentical] = useState(false);

  if (!isOpen || selectedOffers.length === 0) return null;

  const minFinal = Math.min(...selectedOffers.map((o) => o.finalPayablePrice));
  const minFees = Math.min(...selectedOffers.map((o) => o.totalFees));
  const maxTrust = Math.max(...selectedOffers.map((o) => o.listing.trustScore));
  const maxReturnDays = Math.max(
    ...selectedOffers.map((o) => o.listing.returnPolicy.windowDays)
  );

  const rows: ComparisonRowDef[] = [
    {
      id: 'final',
      label: 'True Final Payable Price',
      values: selectedOffers.map((o) => formatINR(o.finalPayablePrice)),
      emphasis: 'final',
      bestIndex: selectedOffers.findIndex((o) => o.finalPayablePrice === minFinal),
    },
    {
      id: 'listed',
      label: 'Listed Sticker Price',
      values: selectedOffers.map((o) => formatINR(o.listedPrice)),
    },
    {
      id: 'savings',
      label: 'Coupons & Bank Discounts',
      values: selectedOffers.map((o) =>
        o.totalOffersSavings > 0 ? `−${formatINR(o.totalOffersSavings)}` : '₹0'
      ),
    },
    {
      id: 'deliveryFee',
      label: 'Delivery Fee',
      values: selectedOffers.map((o) =>
        o.deliveryFee === 0 ? 'Free (₹0)' : `+${formatINR(o.deliveryFee)}`
      ),
    },
    {
      id: 'hiddenFees',
      label: 'Hidden / Checkout Fees',
      values: selectedOffers.map((o) =>
        o.hiddenFeesTotal > 0
          ? `⚠ +${formatINR(o.hiddenFeesTotal)} (${o.hiddenFeesCount})`
          : '₹0 (None)'
      ),
      emphasis: 'warn',
      bestIndex: selectedOffers.findIndex((o) => o.totalFees === minFees),
    },
    {
      id: 'codFee',
      label: 'Cash on Delivery Fee',
      values: selectedOffers.map((o) => (o.codFee > 0 ? `+${formatINR(o.codFee)}` : '₹0')),
    },
    {
      id: 'delivery',
      label: 'Estimated Delivery',
      values: selectedOffers.map((o) => o.estimatedDeliveryLabel),
    },
    {
      id: 'returnWindow',
      label: 'Return Window',
      values: selectedOffers.map((o) => o.listing.returnPolicy.windowLabel),
      emphasis: 'policy',
      bestIndex: selectedOffers.findIndex(
        (o) => o.listing.returnPolicy.windowDays === maxReturnDays && maxReturnDays > 0
      ),
    },
    {
      id: 'returnShipping',
      label: 'Who Pays Return Shipping',
      values: selectedOffers.map((o) => o.listing.returnPolicy.returnShippingLabel),
    },
    {
      id: 'refundMethod',
      label: 'Refund Method',
      values: selectedOffers.map((o) => o.listing.returnPolicy.refundMethod),
    },
    {
      id: 'refundSpeed',
      label: 'Refund Speed',
      values: selectedOffers.map((o) => o.listing.returnPolicy.refundSpeed),
    },
    {
      id: 'restocking',
      label: 'Restocking Fee',
      values: selectedOffers.map((o) => o.listing.returnPolicy.restockingFeeLabel),
    },
    {
      id: 'trust',
      label: 'PriceProof Trust Score',
      values: selectedOffers.map((o) => `${o.listing.trustScore}/100`),
      bestIndex: selectedOffers.findIndex((o) => o.listing.trustScore === maxTrust),
    },
  ];

  const visibleRows = rows.filter((row) => {
    if (!hideIdentical) return true;
    const unique = new Set(row.values);
    return unique.size > 1;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-[#241E14]/60 flex items-end md:items-center justify-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Compare selected stores side by side"
    >
      <div className="w-full max-w-5xl max-h-[88vh] bg-white rounded-t-2xl md:rounded-2xl border border-[#E6D496] shadow-2xl flex flex-col overflow-hidden">
        <div className="px-5 py-4 bg-[#FEF0B8] text-[#241E14] border-b border-[#E6D496] flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mono-eyebrow text-[#855400]">
              SIDE-BY-SIDE STORE COMPARISON ({selectedOffers.length} STORES)
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#241E14] mt-0.5 truncate max-w-xl">
              {productName}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setHideIdentical((v) => !v)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-semibold uppercase tracking-wider border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                hideIdentical
                  ? 'bg-[#241E14] text-[#FDE047] border-[#241E14]'
                  : 'bg-white text-[#241E14] border-[#D9C37B] hover:border-[#241E14]'
              }`}
            >
              {hideIdentical ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{hideIdentical ? 'DIFFERENCES ONLY' : 'HIDE IDENTICAL ROWS'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close comparison drawer"
              className="w-8 h-8 rounded-lg bg-white text-[#241E14] border border-[#D9C37B] flex items-center justify-center hover:bg-[#241E14] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-left min-w-[640px]">
            <thead className="sticky top-0 z-10 bg-[#FFF8DF] border-b border-[#EFE3B8]">
              <tr>
                <th className="p-4 w-52 font-mono text-[10px] uppercase tracking-[0.09em] text-[#855400]">
                  METRIC / POLICY
                </th>
                {selectedOffers.map((offer) => (
                  <th
                    key={offer.listing.storeId}
                    className="p-4 border-l border-[#EFE3B8] align-top"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <StoreMonogram
                          shortCode={offer.listing.shortCode}
                          bg={offer.listing.storeAccentBg}
                          text={offer.listing.storeAccentText}
                          size="sm"
                        />
                        <div>
                          <div className="text-sm font-bold text-[#241E14]">
                            {offer.listing.storeName}
                          </div>
                          {offer.isBestPrice && (
                            <EditorialBadge variant="green" className="mt-1">
                              BEST PRICE
                            </EditorialBadge>
                          )}
                        </div>
                      </div>
                      {selectedOffers.length > 2 && (
                        <button
                          type="button"
                          onClick={() => onRemoveStore(offer.listing.storeId)}
                          aria-label={`Remove ${offer.listing.storeName}`}
                          className="p-1 text-[#857861] hover:text-[#B91C1C] cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5ECCB]">
              {visibleRows.map((row) => {
                const hasDiff = new Set(row.values).size > 1;
                return (
                  <tr
                    key={row.id}
                    className={row.emphasis === 'final' ? 'bg-[#FFFDF0]' : 'bg-white'}
                  >
                    <td className="p-3.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#5C5240]">
                      <div className="flex items-center gap-1.5">
                        {hasDiff && (
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-[2px] bg-[#EAB308] shrink-0"
                            title="Values differ across stores"
                          />
                        )}
                        <span>{row.label}</span>
                      </div>
                    </td>
                    {row.values.map((val, colIdx) => {
                      const isBestCell = hasDiff && row.bestIndex === colIdx;
                      const isWarnCell = val.startsWith('⚠');
                      return (
                        <td
                          key={selectedOffers[colIdx].listing.storeId}
                          className={`p-3.5 border-l border-[#F5ECCB] text-sm tabular-price ${
                            row.emphasis === 'final'
                              ? 'font-mono font-bold text-[16px] text-[#241E14]'
                              : isBestCell
                              ? 'bg-[#ECFDF3] font-semibold text-[#14532D]'
                              : isWarnCell
                              ? 'bg-[#FEF3C7]/70 font-semibold text-[#92400E]'
                              : 'text-[#241E14]'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              <tr className="bg-[#FFF8DF] border-t border-[#EFE3B8]">
                <td className="p-4 font-mono text-[10px] uppercase tracking-wider text-[#855400]">
                  GO TO STORE
                </td>
                {selectedOffers.map((offer) => (
                  <td key={offer.listing.storeId} className="p-4 border-l border-[#EFE3B8]">
                    <a
                      href={offer.listing.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-2.5 px-3 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-colors ${
                        offer.isBestPrice
                          ? 'bg-[#F5B800] text-[#241E14] hover:bg-[#E5A900]'
                          : 'bg-white text-[#241E14] border border-[#D9C37B] hover:bg-[#FEF0B8]'
                      }`}
                    >
                      <span>BUY ON {offer.listing.storeName}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
