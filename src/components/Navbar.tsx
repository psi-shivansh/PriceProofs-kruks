import React from 'react';
import { ShieldCheck, Database, Info, Sparkles, AlertCircle } from 'lucide-react';
import { ProviderDiagnostic } from '../types/product.ts';

interface NavbarProps {
  onOpenDiagnostics: () => void;
  diagnostics: ProviderDiagnostic[];
  totalOffers: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDiagnostics,
  diagnostics,
  totalOffers,
}) => {
  const activeProvidersCount = diagnostics.filter(
    (d) => d.status === 'ACTIVE' || d.status === 'DEMO'
  ).length;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                Price<span className="text-emerald-400">Proof</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                True Cost Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Reveal the Real Cost of Online Shopping — Beyond Deceptive Sticker Prices
            </p>
          </div>
        </div>

        {/* Right CTA & Diagnostics */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDiagnostics}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-850 hover:border-slate-700 text-xs text-slate-300 transition-all cursor-pointer"
            title="Inspect Data Sources & API Integrations"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Data Sources:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {activeProvidersCount} Active
            </span>
          </button>

          <a
            href="#why-real-cost"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Why True Cost?</span>
          </a>
        </div>
      </div>
    </header>
  );
};
