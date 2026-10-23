import React from 'react';
import {
  ArrowUpDown,
  CheckSquare,
  Truck,
  RotateCcw,
  Shield,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { SortOption } from '../types/product.ts';

interface FiltersAndSortBarProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  freeDeliveryOnly: boolean;
  onToggleFreeDelivery: () => void;
  freeReturnsOnly: boolean;
  onToggleFreeReturns: () => void;
  warrantyGuaranteed: boolean;
  onToggleWarrantyGuaranteed: () => void;
  verifiedOnly: boolean;
  onToggleVerifiedOnly: () => void;
  totalOffers: number;
  selectedForCompareCount: number;
  onOpenCompare: () => void;
  onClearCompare: () => void;
}

export const FiltersAndSortBar: React.FC<FiltersAndSortBarProps> = ({
  sortBy,
  onSortChange,
  freeDeliveryOnly,
  onToggleFreeDelivery,
  freeReturnsOnly,
  onToggleFreeReturns,
  warrantyGuaranteed,
  onToggleWarrantyGuaranteed,
  verifiedOnly,
  onToggleVerifiedOnly,
  totalOffers,
  selectedForCompareCount,
  onOpenCompare,
  onClearCompare,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3 border-y border-slate-850 my-6">
      {/* Quick Filter Badges */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium mr-1">Filter by:</span>

        <button
          onClick={onToggleFreeDelivery}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            freeDeliveryOnly
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Free Delivery</span>
        </button>

        <button
          onClick={onToggleFreeReturns}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            freeReturnsOnly
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Free 30d Returns</span>
        </button>

        <button
          onClick={onToggleWarrantyGuaranteed}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            warrantyGuaranteed
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Manufacturer Warranty</span>
        </button>

        <button
          onClick={onToggleVerifiedOnly}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            verifiedOnly
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Exclude estimates where checkout zip code or delivery fees are undisclosed"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>100% Disclosed Totals Only</span>
        </button>
      </div>

      {/* Sort & Compare Status */}
      <div className="flex items-center gap-3">
        {selectedForCompareCount > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in">
            <button
              onClick={onOpenCompare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Compare Selected ({selectedForCompareCount})</span>
            </button>
            <button
              onClick={onClearCompare}
              className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 py-1.5 px-2.5 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="TOTAL_COST_ASC">Real Total Cost (Lowest First) ★</option>
            <option value="STICKER_PRICE_ASC">Advertised Base Price (Sticker)</option>
            <option value="TRANSPARENCY_DESC">Transparency Grade (A to F)</option>
            <option value="DELIVERY_FASTEST">Delivery Speed (Fastest)</option>
            <option value="WARRANTY_LONGEST">Warranty Duration (Longest)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
