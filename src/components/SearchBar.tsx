import React, { useState } from 'react';
import { Search, X, Loader2, Sparkles, Filter, Check } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, selectedProviders?: string[]) => void;
  isLoading: boolean;
  initialQuery?: string;
  selectedProviders: string[];
  onToggleProvider: (providerId: string) => void;
}

const POPULAR_SEARCHES = [
  'wireless headphones',
  'gaming mouse',
  'laptop',
  'mechanical keyboard',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isLoading,
  initialQuery = '',
  selectedProviders,
  onToggleProvider,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleChipClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center">
          <div className="absolute left-4 pointer-events-none text-slate-400">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type any product (e.g. 'wireless headphones', 'gaming mouse', 'laptop')..."
            disabled={isLoading}
            className="w-full h-14 pl-12 pr-28 rounded-2xl bg-slate-900/90 border-2 border-slate-700/80 focus:border-emerald-500 focus:bg-slate-900 text-white placeholder-slate-400 text-base shadow-xl shadow-black/40 transition-all outline-none"
          />

          <div className="absolute right-3 flex items-center gap-2">
            {query && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {isLoading ? 'Comparing...' : 'Search'}
            </button>
          </div>
        </div>
      </form>

      {/* Popular Query Chips & Quick Toggles */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Comparisons:
          </span>
          {POPULAR_SEARCHES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleChipClick(item)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 hover:bg-slate-850 transition-all cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            showFilters
              ? 'bg-slate-800 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Data Sources ({selectedProviders.length})</span>
        </button>
      </div>

      {/* Expanded Provider Filter Drawer */}
      {showFilters && (
        <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="text-xs font-semibold text-slate-300 mb-2">
            Select Active Search Providers:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <label
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer"
              onClick={() => onToggleProvider('demo_provider')}
            >
              <input
                type="checkbox"
                checked={selectedProviders.includes('demo_provider')}
                onChange={() => {}}
                className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-900 focus:ring-0"
              />
              <div>
                <div className="font-medium text-slate-200">Demo Catalog</div>
                <div className="text-[10px] text-slate-400">Multi-seller fee traps</div>
              </div>
            </label>

            <label
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer"
              onClick={() => onToggleProvider('dummyjson_live')}
            >
              <input
                type="checkbox"
                checked={selectedProviders.includes('dummyjson_live')}
                onChange={() => {}}
                className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-900 focus:ring-0"
              />
              <div>
                <div className="font-medium text-slate-200 flex items-center gap-1">
                  <span>Open E-Commerce</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="text-[10px] text-emerald-400/80">Live HTTP API</div>
              </div>
            </label>

            <label
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer"
              onClick={() => onToggleProvider('amazon_paapi')}
            >
              <input
                type="checkbox"
                checked={selectedProviders.includes('amazon_paapi')}
                onChange={() => {}}
                className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-900 focus:ring-0"
              />
              <div>
                <div className="font-medium text-slate-200">Amazon PA-API</div>
                <div className="text-[10px] text-amber-400/80">Official Partner API</div>
              </div>
            </label>

            <label
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer"
              onClick={() => onToggleProvider('flipkart_affiliate')}
            >
              <input
                type="checkbox"
                checked={selectedProviders.includes('flipkart_affiliate')}
                onChange={() => {}}
                className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-900 focus:ring-0"
              />
              <div>
                <div className="font-medium text-slate-200">Flipkart Affiliate</div>
                <div className="text-[10px] text-amber-400/80">India Feed Adapter</div>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
