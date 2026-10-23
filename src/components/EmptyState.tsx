import React from 'react';
import { Search, Sparkles, HelpCircle, AlertCircle, ShoppingBag } from 'lucide-react';

interface EmptyStateProps {
  query?: string;
  onSuggestionClick: (term: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ query, onSuggestionClick }) => {
  const suggestions = [
    { title: 'Wireless Headphones', desc: 'Sony WH-1000XM5, Bose QuietComfort with shipping breakdown', q: 'wireless headphones' },
    { title: 'Gaming Mouse', desc: 'Logitech G Pro X Superlight 2 with sticker trap detection', q: 'gaming mouse' },
    { title: 'Apple MacBook Air', desc: 'M3 Laptop comparing campus pricing with big-box stores', q: 'laptop' },
    { title: 'Mechanical Keyboard', desc: 'Keychron Q1 Pro comparing local vs overseas import shipping', q: 'mechanical keyboard' },
  ];

  return (
    <div className="max-w-3xl mx-auto my-12 text-center py-10 px-6 rounded-3xl bg-slate-900/50 border border-slate-800/80">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 border border-slate-700">
        <ShoppingBag className="w-8 h-8 text-slate-400" />
      </div>

      <h3 className="text-xl font-bold text-white">
        {query ? `No matching products found for "${query}"` : 'Discover the Real Cost of Products'}
      </h3>

      <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
        {query
          ? 'Try checking for typos or searching for a general tech category like headphones, mice, or laptops.'
          : 'E-commerce sites often hide delivery surcharges, restocking penalties, and platform fees behind deceptively low sticker prices. PriceProof audits the full cost before you checkout.'}
      </p>

      {/* Suggested Quick Searches */}
      <div className="mt-8">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Recommended Comparisons to Try:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {suggestions.map((item) => (
            <button
              key={item.q}
              onClick={() => onSuggestionClick(item.q)}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all text-left cursor-pointer group"
            >
              <div className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                {item.title}
              </div>
              <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
